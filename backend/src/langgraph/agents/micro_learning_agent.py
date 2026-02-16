from typing import Dict, Any
from langchain_core.messages import AIMessage, SystemMessage
from src.langgraph.state import UnifiedState
from src.AggregateData.datastore import Datastore
from src.llm.gemini import get_gemini_llm

async def micro_learning_agent(state: UnifiedState, datastore: Datastore) -> Dict[str, Any]:
    """
    Agent responsible for delivering micro-learning content using LLM.
    """
    user_id = state.get("user_id", "default_user")
    user_info = await datastore.get_user_info(user_id)
    
    llm = get_gemini_llm()
    
    if not llm:
        topic = "Sustainability"
        content = "Tip: Reduce, Reuse, Recycle."
        return {
            "structured_data": {"learning_content": {"topic": topic, "content": content}},
             "messages": [AIMessage(content=content)]
        }

    prompt = (
        f"Generate a short, engaging micro-learning fact or tip about the environment for this user.\n"
        f"User Preferences: {user_info.get('preferences')}\n"
        "Keep it under 2 sentences. Make it actionable."
    )
    
    try:
        response = await llm.ainvoke([SystemMessage(content=prompt)])
        return {
            "structured_data": {"learning_content": {"generated": True}},
            "messages": [response]
        }
    except Exception as e:
         return {
            "structured_data": {"error": str(e)},
            "messages": [AIMessage(content="Error generating learning content.")]
        }

