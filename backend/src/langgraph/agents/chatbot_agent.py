from typing import Dict, Any
from langchain_core.messages import AIMessage, SystemMessage
from src.langgraph.state import UnifiedState
from src.AggregateData.datastore import Datastore
from src.llm.gemini import get_gemini_llm

async def chatbot_agent(state: UnifiedState, datastore: Datastore) -> Dict[str, Any]:
    """
    Agent responsible for general conversation, intent matching, and tracking user state using LLM.
    """
    messages = state["messages"]
    
    llm = get_gemini_llm()
    
    if not llm:
        return {
            "structured_data": {"confidence": 0.0, "error": "LLM_UNAVAILABLE"},
            "messages": [AIMessage(content="I'm having trouble connecting to my brain right now. Please check my API key.")]
        }

    system_prompt = (
        "You are Prakriti, a knowledgeable and friendly environmental assistant.\n"
        "Your goal is to help users understand environmental data, sustainability, and their impact.\n"
        "Be concise, encouraging, and scientifically accurate.\n"
        "If the user asks about something specific like weather or simulations, briefly acknowledge it and "
        "mention that you can help them analyze that if they ask specifically (knowing the supervisor directs those tasks)."
    )
    
    try:
        # Combine system prompt with history
        conversation = [SystemMessage(content=system_prompt)] + messages
        
        response = await llm.ainvoke(conversation)
        
        return {
            "structured_data": {
                "behavioral_drift": 0.0, # Placeholder for more advanced logic
                "confidence": 1.0, 
                "intent": "general_chat"
            },
            "messages": [response]
        }
    except Exception as e:
         return {
            "structured_data": {"error": str(e)},
            "messages": [AIMessage(content="I encountered an error while thinking.")]
        }

