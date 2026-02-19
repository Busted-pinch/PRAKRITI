from typing import Dict, Any
from langchain_core.messages import AIMessage, SystemMessage
from src.langgraph.state import UnifiedState
from src.core.aggregate_data import AggregateData
from src.llm.gemini import get_gemini_llm
from langchain_core.messages import HumanMessage
from loguru import logger

async def digital_twin_agent(state: UnifiedState, datastore: AggregateData) -> Dict[str, Any]:
    """
    Agent responsible for Digital Twin predictions and simulations via LLM interpretation.
    """
    logger.info("Digital Twin Agent: Started simulation analysis")
    # Mock simulation parameters
    location = "Urban Center"
    
    # In reality, this would run a complex model
    simulation_result = {
        "scenario": "Traffic Reduction",
        "impact": "Carbon emission reduced by 15%",
        "confidence": 0.85,
        "details": "Reduction in NOx levels by 10% expected within 2 weeks."
    }
    logger.debug(f"Digital Twin: Simulation result: {simulation_result}")
    
    llm = get_gemini_llm()
    
    if not llm:
         logger.warning("Digital Twin: LLM unavailable, returning raw result")
         return {
            "structured_data": {"simulation_result": simulation_result},
            "messages": [AIMessage(content=f"Simulation Result: {simulation_result}")]
        }
        
    system_prompt = "You are a Digital Twin interface. Explain the impact of the simulation in simple terms and highlight the confidence level."
    human_prompt = (
        f"Interpret the following simulation result:\n"
        f"Scenario: {simulation_result['scenario']}\n"
        f"Data: {simulation_result}"
    )
    
    try:
        logger.info("Digital Twin: Invoking LLM")
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt)
        ])
        logger.info("Digital Twin: LLM response received")
        return {
            "structured_data": {"simulation_result": simulation_result},
            "messages": [response]
        }
    except Exception as e:
        logger.error(f"Digital Twin Error: {e}")
        return {
            "structured_data": {"error": str(e)},
            "messages": [AIMessage(content="Error interpreting simulation.")]
        }

