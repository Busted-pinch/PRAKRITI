from typing import Dict, Any
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage
from src.langgraph.state import UnifiedState
from src.core.aggregate_data import Datastore
from src.llm.gemini import get_gemini_llm
from loguru import logger

async def environment_agent(state: UnifiedState, datastore: Datastore) -> Dict[str, Any]:
    """
    Agent responsible for analyzing environmental data using LLM.
    """
    logger.info("Environment Agent: Started analysis")
    # Extract location (Mock extraction, ideally LLM extracts this too)
    location = "New York" 
    
    # Fetch Data
    # Mock Data Fetch (Datastore methods get_weather_data/get_climate_info aren't implemented yet)
    # real implementation would use: 
    # weather = datastore.get_or_fetch_environment(...) 
    weather = {"temperature": 22, "condition": "Sunny", "humidity": 45}
    climate = {"co2_level": 415, "aqi": 95}
    logger.debug(f"Environment: Fetched data for {location}: {weather}, {climate}")
    
    llm = get_gemini_llm()
    
    if not llm:
        logger.warning("Environment: LLM unavailable, returning raw data")
        # Fallback if no LLM
        analysis = f"Weather: {weather}. Climate: {climate}."
        return {
             "structured_data": {"environment_analysis": {**weather, **climate}},
             "messages": [AIMessage(content=analysis)]
        }

    # Generate Analysis
    system_prompt = "You are an environmental analyst. Provide a concise summary of the conditions and health/environmental implications."
    human_prompt = (
        f"Analyze the following environmental data for {location}:\n"
        f"Weather: {weather}\n"
        f"Climate Stats: {climate}\n\n"
        "Suggest one eco-friendly action the user can take today."
    )
    
    try:
        logger.info("Environment: Invoking LLM")
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt)
        ])
        logger.info("Environment: LLM response received")
        
        return {
            "structured_data": {"environment_analysis": {**weather, **climate}},
            "messages": [response]
        }
    except Exception as e:
        logger.error(f"Environment Error: {e}")
        return {
            "structured_data": {"error": str(e)},
            "messages": [AIMessage(content="Error analyzing environment data.")]
        }

