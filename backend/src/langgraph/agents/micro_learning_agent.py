from typing import Dict, Any
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage
from src.langgraph.state import UnifiedState
from src.core.aggregate_data import AggregateData
from src.llm.gemini import get_gemini_llm
from loguru import logger

async def micro_learning_agent(state: UnifiedState, datastore: AggregateData) -> Dict[str, Any]:
    """
    Agent responsible for delivering micro-learning content using LLM.
    """
    logger.info("Micro Learning Agent: Started generation")
    user_id = state.get("user_id")
    user_info = None
    if user_id:
        try:
             user_info = datastore.get_user(user_id)
             logger.debug(f"Micro Learning: Fetched user info for {user_id}")
        except Exception as e:
             logger.warning(f"Micro Learning: Failed to fetch user info: {e}")
             pass
    
    llm = get_gemini_llm()
    
    if not llm:
        logger.warning("Micro Learning: LLM unavailable, returning static content")
        topic = "Sustainability"
        content = "Tip: Reduce, Reuse, Recycle."
        return {
            "structured_data": {"learning_content": {"topic": topic, "content": content}},
             "messages": [AIMessage(content=content)]
        }

    system_prompt = "You are a helpful environmental educator. Generate a short, engaging micro-learning fact or tip."
    human_prompt = (
        f"User Preferences: {user_info.home_location if user_info else 'General'}\n"
        "Generate a tip under 2 sentences. Make it actionable."
    )
    
    try:
        logger.info("Micro Learning: Invoking LLM")
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt)
        ])
        logger.info("Micro Learning: LLM response received")
        return {
            "structured_data": {"learning_content": {"generated": True}},
            "messages": [response]
        }
    except Exception as e:
         logger.error(f"Micro Learning Error: {e}")
         return {
            "structured_data": {"error": str(e)},
            "messages": [AIMessage(content="Error generating learning content.")]
        }

