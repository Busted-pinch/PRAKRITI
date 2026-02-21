from typing import Dict, Any
from langchain_core.messages import AIMessage, SystemMessage
from src.langgraph.state import UnifiedState
from src.core.aggregate_data import AggregateData
from src.llm.factory import get_llm
from loguru import logger


async def chatbot_agent(state: UnifiedState, datastore: AggregateData) -> Dict[str, Any]:
    """
    General conversational chatbot.
    Now risk-context aware.
    """

    logger.info("Chatbot Agent: Started processing")

    messages = state["messages"]
    llm = get_llm(provider="grok")
    twin_context = state.get("structured_data", {}).get("llm_context", {})

    if not llm:
        return {
            "structured_data": {"confidence": 0.0},
            "messages": [
                AIMessage(content="I'm having trouble accessing my intelligence layer right now.")
            ]
        }

    system_prompt = (
        "You are Prakriti, a friendly environmental assistant.\n"
        "Be concise, supportive, and scientifically grounded.\n"
        f"User Environmental Risk Context: {twin_context}\n"
        "Adjust tone subtly if risk level is high."
    )

    try:
        response = await llm.ainvoke(
            [SystemMessage(content=system_prompt)] + messages
        )

        return {
            "structured_data": {"confidence": 1.0},
            "messages": [response]
        }

    except Exception as e:
        logger.error(f"Chatbot Error: {e}")
        return {
            "structured_data": {"error": str(e)},
            "messages": [AIMessage(content="I encountered an error while responding.")]
        }