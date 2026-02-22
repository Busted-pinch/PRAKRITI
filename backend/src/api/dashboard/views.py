from fastapi import APIRouter, Depends
import json
import asyncio
from langchain_core.messages import HumanMessage, SystemMessage

from src.api.deps import get_current_user
from src.core.aggregate_data import AggregateData
from src.core.logger import logger
from src.llm.factory import get_llm

router = APIRouter(dependencies=[Depends(get_current_user)])
datastore = AggregateData()

# LLM via factory — Groq Cloud (key starts with gsk_) with graceful fallback to Gemini
_llm = get_llm(provider="groq", temperature=0.7)


async def _call_llm(system: str, prompt: str) -> str:
    """Async LLM call via factory-provided instance. Returns plain text."""
    if _llm is None:
        return "Insight unavailable."
    try:
        response = await _llm.ainvoke([
            SystemMessage(content=system),
            HumanMessage(content=prompt),
        ])
        return response.content.strip()
    except Exception as e:
        logger.error(f"[Dashboard LLM] {e}")
        return "Insight unavailable."


# ─────────────────────────────────────────────────────────────────────────────
# Feature 1: Contextualized Daily Briefing
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/daily-briefing")
async def get_daily_briefing(lat: float, lon: float, user=Depends(get_current_user)):
    """
    Returns a 2-3 sentence morning briefing that:
    - Compares today vs yesterday (inferred) and seasonal average
    - Highlights anomalies
    - Gives one actionable tip
    Data: get_environment_snapshot + get_behavior_profile (no twin data)
    """
    user_id = user.get("sub") or user.get("id") if isinstance(user, dict) else getattr(user, "id", "demo-id")

    from src.core.cache import get_cache, set_cache
    cache_key = f"daily_briefing:{user_id}:{round(lat, 3)}:{round(lon, 3)}"
    cached = await get_cache(cache_key)
    if cached:
        return {"briefing": cached}

    env = await datastore.get_environment_snapshot(lat, lon)
    behavior = await datastore.get_behavior_profile(user_id)

    system_msg = (
        "You are Prakriti, an advanced AI environmental companion. "
        "Be concise. Never use markdown or bullet points."
    )
    user_msg = f"""Generate a 2-3 sentence contextualized morning environmental briefing.
Compare today's conditions to what yesterday likely was and to the typical seasonal average.
Highlight any anomalies. End with one actionable tip.
Style: "Today will feel hotter than yesterday by 3°C. Dry air increases dehydration risk. Ideal time for outdoor tasks: before 10 AM."
Plain text, no markdown.

Environment snapshot: {json.dumps(env)}
User profile: {json.dumps(behavior)}"""

    result = await _call_llm(system_msg, user_msg)

    if result != "Insight unavailable.":
        await set_cache(cache_key, result, ttl=3 * 3600)

    return {"briefing": result}


# ─────────────────────────────────────────────────────────────────────────────
# Feature 2: Emotional UX Layer
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/emotional-ux")
async def get_emotional_ux(lat: float, lon: float, user=Depends(get_current_user)):
    """
    Returns one sentence that tells the user how today's environment may
    affect their mood or productivity.
    Data: get_environment_snapshot + get_behavior_profile (no twin data)
    """
    user_id = user.get("sub") or user.get("id") if isinstance(user, dict) else getattr(user, "id", "demo-id")

    from src.core.cache import get_cache, set_cache
    cache_key = f"emotional_ux:{user_id}:{round(lat, 3)}:{round(lon, 3)}"
    cached = await get_cache(cache_key)
    if cached:
        return {"insight": cached}

    env = await datastore.get_environment_snapshot(lat, lon)
    behavior = await datastore.get_behavior_profile(user_id)

    system_msg = (
        "You are Prakriti, an advanced AI environmental companion. "
        "Be concise. Never use markdown."
    )
    user_msg = f"""Write exactly one sentence: how might today's weather affect this user's mood or productivity?
Sound like a warm, intelligent companion.
Examples: "Clear skies today — great day for deep focus work." / "Heavy humidity may reduce mental alertness; pace yourself."
One sentence only, plain text.

Environment snapshot: {json.dumps(env)}
User profile: {json.dumps(behavior)}"""

    result = await _call_llm(system_msg, user_msg)

    if result != "Insight unavailable.":
        await set_cache(cache_key, result, ttl=3 * 3600)

    return {"insight": result}


# ─────────────────────────────────────────────────────────────────────────────
# Feature 3: Environmental Parameter Insights (per-card LLM explanations)
# ─────────────────────────────────────────────────────────────────────────────

_METRIC_META = {
    "aqi": {"label": "AQI (Air Quality Index)", "unit": ""},
    "temperature": {"label": "Temperature", "unit": "°C"},
    "humidity": {"label": "Humidity", "unit": "%"},
    "wind_speed": {"label": "Wind Speed", "unit": "km/h"},
    "uv_index": {"label": "UV Index", "unit": ""},
    "pm2_5": {"label": "PM2.5 (Fine Particles)", "unit": "μg/m³"},
    "pm10": {"label": "PM10 (Coarse Particles)", "unit": "μg/m³"},
    "ozone": {"label": "Ozone (O₃)", "unit": "μg/m³"},
    "nitrogen_dioxide": {"label": "Nitrogen Dioxide (NO₂)", "unit": "μg/m³"},
}


async def _insight_for_metric(metric_key: str, value, env: dict, behavior: dict) -> str:
    """Generate a personalised 2-3 sentence insight for a single metric."""
    meta = _METRIC_META.get(metric_key, {"label": metric_key, "unit": ""})
    label = meta["label"]
    unit = meta["unit"]
    formatted_value = f"{value:.1f}{unit}" if isinstance(value, float) else f"{value}{unit}" if value is not None else "N/A"

    system_msg = (
        "You are Prakriti, a warm and intelligent AI environmental companion. "
        "Be concise, empathetic, and specific. Never use markdown or bullet points. Plain text only."
    )
    user_msg = (
        f"The current {label} reading is {formatted_value}. "
        f"In 2-3 plain sentences, tell the user what this specific value means for their daily life, "
        f"health, and activities — personalised to their profile below. "
        f"Be direct and actionable. No markdown.\n\n"
        f"Full environment snapshot: {json.dumps(env)}\n"
        f"User behavior/health profile: {json.dumps(behavior)}"
    )
    return await _call_llm(system_msg, user_msg)


@router.get("/env-insights")
async def get_env_insights(lat: float, lon: float, user=Depends(get_current_user)):
    """
    Returns personalised LLM insights for all 9 environmental metrics displayed
    on the dashboard. All metrics are generated in parallel and cached for 3 hours.
    Response: { "insights": { "aqi": "...", "temperature": "...", ... } }
    """
    user_id = user.get("sub") or user.get("id") if isinstance(user, dict) else getattr(user, "id", "demo-id")

    from src.core.cache import get_cache, set_cache
    cache_key = f"env_insights:{user_id}:{round(lat, 3)}:{round(lon, 3)}"
    cached = await get_cache(cache_key)
    if cached:
        # Validate: skip stale entries where LLM previously failed (all null / 'unavailable')
        valid_entries = [
            v for v in cached.values()
            if v and isinstance(v, str) and "unavailable" not in v.lower()
        ]
        if valid_entries:
            return {"insights": cached}
        # Stale cache — fall through to regenerate
        logger.info("[env-insights] Stale cache detected (all unavailable), regenerating.")

    env = await datastore.get_environment_snapshot(lat, lon)
    behavior = await datastore.get_behavior_profile(user_id)

    metric_keys = list(_METRIC_META.keys())

    results = await asyncio.gather(
        *[_insight_for_metric(key, env.get(key), env, behavior) for key in metric_keys],
        return_exceptions=True
    )

    insights = {}
    for key, result in zip(metric_keys, results):
        if isinstance(result, Exception):
            logger.error(f"[env-insights] Error for {key}: {result}")
            insights[key] = None  # return null; frontend shows loading pulse, not 'unavailable'
        else:
            insights[key] = result

    # Only cache if at least one real insight was generated
    successful = [v for v in insights.values() if v and v != "Insight unavailable."]
    if successful:
        await set_cache(cache_key, insights, ttl=3 * 3600)
    return {"insights": insights}
