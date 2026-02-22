from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime, timezone
from src.api.deps import get_current_user
from src.core.supabase_client import supabase
from src.core.logger import logger

router = APIRouter(dependencies=[Depends(get_current_user)])

# ─── Achievement catalog ─────────────────────────────────────────────────────
# Each achievement has: id, name, desc, icon, and a check function
# that receives (cards_explored, tab_interactions, total_points) → bool

ALL_ACHIEVEMENTS = [
    # Metric card achievements (one per card)
    {"id": "air_detective",       "name": "Air Detective",        "desc": "Opened the AQI card",              "icon": "🌬️"},
    {"id": "heat_seeker",         "name": "Heat Seeker",          "desc": "Opened the Temperature card",      "icon": "🌡️"},
    {"id": "moisture_maven",      "name": "Moisture Maven",       "desc": "Opened the Humidity card",         "icon": "💧"},
    {"id": "wind_whisperer",      "name": "Wind Whisperer",       "desc": "Opened the Wind Speed card",       "icon": "🌪️"},
    {"id": "sun_sentinel",        "name": "Sun Sentinel",         "desc": "Opened the UV Index card",         "icon": "☀️"},
    {"id": "particle_sleuth",     "name": "Particle Sleuth",      "desc": "Opened the PM2.5 card",            "icon": "🫧"},
    {"id": "smoke_scanner",       "name": "Smoke Scanner",        "desc": "Opened the PM10 card",             "icon": "🌫️"},
    {"id": "ozone_oracle",        "name": "Ozone Oracle",         "desc": "Opened the Ozone card",            "icon": "🌀"},
    {"id": "nitrogen_navigator",  "name": "Nitrogen Navigator",   "desc": "Opened the NO₂ card",              "icon": "⚗️"},
    # Milestone achievements
    {"id": "all_seeing_eye",      "name": "All-Seeing Eye",       "desc": "Opened all 9 metric cards",        "icon": "🔭"},
    {"id": "news_hound",          "name": "News Hound",           "desc": "Visited the Environmental News tab","icon": "📰"},
    {"id": "law_keeper",          "name": "Law Keeper",           "desc": "Visited the Laws & Agreements tab", "icon": "⚖️"},
    {"id": "community_connector", "name": "Community Connector",  "desc": "Visited the NGOs Around Me tab",   "icon": "🤝"},
    {"id": "tab_explorer",        "name": "Tab Explorer",         "desc": "Visited all 3 section tabs",       "icon": "🗺️"},
    {"id": "prakriti_pioneer",    "name": "Prakriti Pioneer",     "desc": "Earned 50 or more total points",   "icon": "🌟"},
    {"id": "eco_veteran",         "name": "Eco Veteran",          "desc": "Earned 100 or more total points",  "icon": "🏆"},
]

# Map card key → achievement id
CARD_ACHIEVEMENT_MAP = {
    "aqi":               "air_detective",
    "temperature":       "heat_seeker",
    "humidity":          "moisture_maven",
    "wind_speed":        "wind_whisperer",
    "uv_index":          "sun_sentinel",
    "pm2_5":             "particle_sleuth",
    "pm10":              "smoke_scanner",
    "ozone":             "ozone_oracle",
    "nitrogen_dioxide":  "nitrogen_navigator",
}

ALL_CARD_KEYS = set(CARD_ACHIEVEMENT_MAP.keys())
ALL_TAB_KEYS = {"env", "laws", "ngo"}

TAB_ACHIEVEMENT_MAP = {
    "env":   "news_hound",
    "laws":  "law_keeper",
    "ngo":   "community_connector",
}

# ─── Points config ────────────────────────────────────────────────────────────
CARD_POINTS_FIRST = 5
CARD_POINTS_REPEAT = 1
TAB_POINTS_FIRST = 3
TAB_POINTS_REPEAT = 1


def _compute_achievements(
    cards_explored: dict,
    tab_interactions: dict,
    total_points: int,
    existing_ids: set,
) -> list[dict]:
    """Return list of newly unlocked achievement dicts."""
    new = []

    def unlock(achievement_id: str):
        if achievement_id not in existing_ids:
            match = next((a for a in ALL_ACHIEVEMENTS if a["id"] == achievement_id), None)
            if match:
                new.append({**match, "earned_at": datetime.now(timezone.utc).isoformat()})
                existing_ids.add(achievement_id)

    # Per-card achievements
    for card_key, ach_id in CARD_ACHIEVEMENT_MAP.items():
        if cards_explored.get(card_key, 0) > 0:
            unlock(ach_id)

    # All 9 cards
    if all(cards_explored.get(k, 0) > 0 for k in ALL_CARD_KEYS):
        unlock("all_seeing_eye")

    # Per-tab achievements
    for tab_key, ach_id in TAB_ACHIEVEMENT_MAP.items():
        if tab_interactions.get(tab_key, 0) > 0:
            unlock(ach_id)

    # All 3 tabs
    if all(tab_interactions.get(k, 0) > 0 for k in ALL_TAB_KEYS):
        unlock("tab_explorer")

    # Point milestones
    if total_points >= 50:
        unlock("prakriti_pioneer")
    if total_points >= 100:
        unlock("eco_veteran")

    return new


def _get_or_create_rewards(user_id: str) -> dict:
    """Fetch existing rewards row or return defaults."""
    try:
        res = supabase.table("user_rewards").select("*").eq("user_id", user_id).execute()
        if res.data and len(res.data) > 0:
            row = res.data[0]
            return {
                "total_points": row.get("total_points", 0),
                "cards_explored": row.get("cards_explored") or {},
                "tab_interactions": row.get("tab_interactions") or {},
                "achievements": row.get("achievements") or [],
            }
    except Exception as e:
        logger.error(f"[rewards] fetch error: {e}")
    return {"total_points": 0, "cards_explored": {}, "tab_interactions": {}, "achievements": []}


def _upsert_rewards(user_id: str, data: dict):
    try:
        supabase.table("user_rewards").upsert(
            {"user_id": user_id, **data, "updated_at": datetime.now(timezone.utc).isoformat()},
            on_conflict="user_id"
        ).execute()
    except Exception as e:
        logger.error(f"[rewards] upsert error: {e}")


# ─── Schemas ──────────────────────────────────────────────────────────────────
class ActionPayload(BaseModel):
    action_type: str   # "card_open" | "tab_switch"
    action_key: str    # e.g. "aqi", "temperature", "env", "laws", "ngo"


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("")
async def get_rewards(user=Depends(get_current_user)):
    """Fetch the current user's full reward state."""
    user_id = str(user.id)
    state = _get_or_create_rewards(user_id)

    # Annotate every achievement with unlocked status
    unlocked_ids = {a["id"] for a in state["achievements"]}
    full_achievements = [
        {**a, "unlocked": a["id"] in unlocked_ids,
         "earned_at": next((x["earned_at"] for x in state["achievements"] if x["id"] == a["id"]), None)}
        for a in ALL_ACHIEVEMENTS
    ]

    return {
        "total_points": state["total_points"],
        "cards_explored": state["cards_explored"],
        "tab_interactions": state["tab_interactions"],
        "achievements": full_achievements,
    }


@router.post("/action")
async def record_action(payload: ActionPayload, user=Depends(get_current_user)):
    """Record an exploration action and award points."""
    user_id = str(user.id)
    state = _get_or_create_rewards(user_id)

    cards = dict(state["cards_explored"])
    tabs = dict(state["tab_interactions"])
    points = state["total_points"]
    earned_achievements = list(state["achievements"])
    existing_ids = {a["id"] for a in earned_achievements}

    points_earned = 0

    if payload.action_type == "card_open" and payload.action_key in ALL_CARD_KEYS:
        prev = cards.get(payload.action_key, 0)
        cards[payload.action_key] = prev + 1
        points_earned = CARD_POINTS_FIRST if prev == 0 else CARD_POINTS_REPEAT

    elif payload.action_type == "tab_switch" and payload.action_key in ALL_TAB_KEYS:
        prev = tabs.get(payload.action_key, 0)
        tabs[payload.action_key] = prev + 1
        points_earned = TAB_POINTS_FIRST if prev == 0 else TAB_POINTS_REPEAT

    points += points_earned

    new_achievements = _compute_achievements(cards, tabs, points, existing_ids)
    earned_achievements.extend(new_achievements)

    new_state = {
        "total_points": points,
        "cards_explored": cards,
        "tab_interactions": tabs,
        "achievements": earned_achievements,
    }
    _upsert_rewards(user_id, new_state)

    # Return full annotated achievement list
    unlocked_ids = {a["id"] for a in earned_achievements}
    full_achievements = [
        {**a, "unlocked": a["id"] in unlocked_ids,
         "earned_at": next((x["earned_at"] for x in earned_achievements if x["id"] == a["id"]), None)}
        for a in ALL_ACHIEVEMENTS
    ]

    return {
        "total_points": points,
        "points_earned": points_earned,
        "cards_explored": cards,
        "tab_interactions": tabs,
        "achievements": full_achievements,
        "new_achievements": new_achievements,
    }
