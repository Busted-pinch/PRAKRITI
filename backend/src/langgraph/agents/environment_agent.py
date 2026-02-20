from typing import Dict, Any
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage
from src.langgraph.state import UnifiedState
from src.core.aggregate_data import AggregateData
from src.llm.gemini import get_gemini_llm
from loguru import logger
from datetime import datetime, timedelta


async def environment_agent(state: UnifiedState, datastore: AggregateData) -> Dict[str, Any]:
    """
    Environment Agent using unified datastore (Redis → DB → APIs).
    Now risk-aware using Digital Twin llm_context.
    """

    logger.info("Environment Agent: Started analysis")

    lat = state.get("lat")
    lon = state.get("lon")
    user_id = state.get("user_id")

    if lat is None or lon is None:
        return {
            "structured_data": {"error": "Location not provided."},
            "messages": [AIMessage(content="Location data is missing.")]
        }

    # 1️⃣ Fetch environment snapshot
    env_data = await datastore.get_or_fetch_environment(
        session_id=user_id or "anonymous",
        lat=lat,
        lon=lon,
        forecast=False
    )

    if not env_data:
        return {
            "structured_data": {"error": "No environment data available."},
            "messages": [AIMessage(content="Unable to retrieve environment data.")]
        }

    structured = env_data.model_dump()

    # 2️⃣ Persist exposure snapshot (throttled 10 minutes)
    try:
        if user_id and structured.get("pm2_5") is not None:
            from src.core.supabase_client import supabase

            recent = supabase.table("user_environment_sessions") \
                .select("recorded_at") \
                .eq("user_id", user_id) \
                .order("recorded_at", desc=True) \
                .limit(1) \
                .execute()

            should_insert = True

            if recent.data:
                last_time = datetime.fromisoformat(
                    recent.data[0]["recorded_at"].replace("Z", "")
                )
                if (datetime.utcnow() - last_time) < timedelta(minutes=10):
                    should_insert = False

            if should_insert:
                supabase.table("user_environment_sessions").insert({
                    "user_id": user_id,
                    "session_id": user_id,
                    "lat": lat,
                    "lon": lon,
                    "temperature": structured.get("temperature"),
                    "humidity": structured.get("humidity"),
                    "wind_speed": structured.get("wind_speed"),
                    "pm2_5": structured.get("pm2_5"),
                    "pm10": structured.get("pm10"),
                    "ozone": structured.get("ozone"),
                    "nitrogen_dioxide": structured.get("nitrogen_dioxide"),
                    "aqi": structured.get("aqi"),
                }).execute()

    except Exception as e:
        logger.warning(f"Exposure logging failed: {e}")

    # 3️⃣ Risk-aware LLM summary
    llm = get_gemini_llm()
    twin_context = state.get("structured_data", {}).get("llm_context", {})

    if not llm:
        return {
            "structured_data": structured,
            "messages": [
                AIMessage(
                    content=(
                        f"Temperature is {structured.get('temperature')}°C. "
                        f"PM2.5 is {structured.get('pm2_5')}."
                    )
                )
            ]
        }

    system_prompt = (
        "You are an environmental health analyst.\n"
        "Provide a concise health-focused environmental summary.\n"
        "Adjust tone based on user's risk level and trend."
    )

    human_prompt = f"""
    Environment Data:
    {structured}

    User Risk Context:
    {twin_context}

    Provide:
    1. Health-focused summary
    2. One practical eco-friendly recommendation
    """

    try:
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt)
        ])

        return {
            "structured_data": structured,
            "messages": [response]
        }

    except Exception as e:
        logger.error(f"Environment LLM Error: {e}")
        return {
            "structured_data": structured,
            "messages": [AIMessage(content="Error analyzing environment data.")]
        }