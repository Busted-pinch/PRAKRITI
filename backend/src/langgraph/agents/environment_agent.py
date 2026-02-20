from typing import Dict, Any
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage
from src.langgraph.state import UnifiedState
from src.core.aggregate_data import AggregateData
from src.llm.gemini import get_gemini_llm
from loguru import logger


async def environment_agent(state: UnifiedState, datastore: AggregateData) -> Dict[str, Any]:
    """
    Environment Agent using unified datastore (Redis → DB → APIs).
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

    # 🔹 Use unified datastore (cache-first)
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

    llm = get_gemini_llm()

    if not llm:
        return {
            "structured_data": structured,
            "messages": [AIMessage(
                content=f"Current temperature is {structured.get('temperature')}°C and PM2.5 is {structured.get('pm2_5')}."
            )]
        }

    system_prompt = (
        "You are an environmental analyst. "
        "Provide a concise health-focused environmental summary."
    )

    human_prompt = (
        f"Environment Data:\n{structured}\n\n"
        "Provide:\n"
        "1. A short health/environmental summary\n"
        "2. One practical eco-friendly suggestion"
    )

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
        logger.error(f"Environment Error: {e}")
        return {
            "structured_data": structured,
            "messages": [AIMessage(content="Error analyzing environment data.")]
        }