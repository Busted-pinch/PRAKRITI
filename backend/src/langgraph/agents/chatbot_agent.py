from typing import Dict, Any
from langchain_core.messages import AIMessage, SystemMessage
from src.langgraph.state import UnifiedState
from src.core.aggregate_data import AggregateData
from src.llm.gemini import get_gemini_llm
from loguru import logger

async def chatbot_agent(state: UnifiedState, datastore: AggregateData) -> Dict[str, Any]:
    """
    Agent responsible for general conversation, intent matching, and tracking user state using LLM.
    """
    logger.info("Chatbot Agent: Started processing")
    messages = state["messages"]
    
    llm = get_gemini_llm()
    
    if not llm:
        logger.warning("Chatbot: LLM unavailable")
        return {
            "structured_data": {"confidence": 0.0, "error": "LLM_UNAVAILABLE"},
            "messages": [AIMessage(content="I'm having trouble connecting to my brain right now. Please check my API key.")]
        }


    # Fetch User Context
    user_id = state.get("user_id")
    user_name = "Friend"
    user_data = None
    
    if user_id:
        try:
            user_data = datastore.get_user(user_id)
            if user_data and user_data.name:
                user_name = user_data.name
            logger.debug(f"Chatbot: Fetched user data for {user_id}")
        except Exception as e:
            logger.error(f"Chatbot Agent: Error fetching user data: {e}")

    system_prompt = (
        f"You are Prakriti, a knowledgeable and friendly environmental assistant.\n"
        f"You are talking to {user_name}.\n"
        "Your goal is to help users understand environmental data, sustainability, and their impact.\n"
        "Be concise, encouraging, and scientifically accurate.\n"
        "If the user asks about something specific like weather or simulations, briefly acknowledge it and "
        "mention that you can help them analyze that if they ask specifically (knowing the supervisor directs those tasks)."
    )
    
    try:
        # Combine system prompt with history
        conversation = [SystemMessage(content=system_prompt)] + messages
        
        logger.info("Chatbot: Invoking LLM")
        response = await llm.ainvoke(conversation)
        logger.info("Chatbot: LLM response received")
        
        return {
            "structured_data": {
                "behavioral_drift": 0.0, # Placeholder for more advanced logic
                "confidence": 1.0, 
                "intent": "general_chat"
            },
            "messages": [response]
        }
    except Exception as e:
         logger.error(f"Chatbot Error: {e}")
         return {
            "structured_data": {"error": str(e)},
            "messages": [AIMessage(content="I encountered an error while thinking.")]
        }

