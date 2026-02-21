from fastapi import APIRouter, Depends
import json
from langchain_core.messages import HumanMessage, SystemMessage

from src.api.deps import get_current_user
from src.core.aggregate_data import AggregateData
from src.core.logger import logger
from src.llm.factory import get_llm

router = APIRouter(dependencies=[Depends(get_current_user)])
datastore = AggregateData()

# LLM via factory — Grok (xAI) with graceful fallback to Gemini
_llm = get_llm(provider="grok", temperature=0.7)


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
    user_id = getattr(user, "id", "demo-id")

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
    user_id = getattr(user, "id", "demo-id")

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
