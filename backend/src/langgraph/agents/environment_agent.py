from typing import Dict, Any
from langchain_core.messages import AIMessage, SystemMessage
from src.langgraph.state import UnifiedState
from src.AggregateData.datastore import Datastore
from src.llm.gemini import get_gemini_llm

async def environment_agent(state: UnifiedState, datastore: Datastore) -> Dict[str, Any]:
    """
    Agent responsible for analyzing environmental data using LLM.
    """
    # Extract location (Mock extraction, ideally LLM extracts this too)
    location = "New York" 
    
    # Fetch Data
    weather = await datastore.get_weather_data(location)
    climate = await datastore.get_climate_info(location)
    
    llm = get_gemini_llm()
    
    if not llm:
        # Fallback if no LLM
        analysis = f"Weather: {weather}. Climate: {climate}."
        return {
             "structured_data": {"environment_analysis": {**weather, **climate}},
             "messages": [AIMessage(content=analysis)]
        }

    # Generate Analysis
    prompt = (
        f"Analyze the following environmental data for {location}:\n"
        f"Weather: {weather}\n"
        f"Climate Stats: {climate}\n\n"
        "Provide a concise summary of the current conditions and any health or environmental implications. "
        "Suggest one eco-friendly action the user can take today based on this."
    )
    
    try:
        response = await llm.ainvoke([SystemMessage(content=prompt)])
        
        return {
            "structured_data": {"environment_analysis": {**weather, **climate}},
            "messages": [response]
        }
    except Exception as e:
        return {
            "structured_data": {"error": str(e)},
            "messages": [AIMessage(content="Error analyzing environment data.")]
        }

