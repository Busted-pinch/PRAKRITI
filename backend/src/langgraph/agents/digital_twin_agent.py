from typing import Dict, Any
from langchain_core.messages import AIMessage, SystemMessage
from src.langgraph.state import UnifiedState
from src.AggregateData.datastore import Datastore
from src.llm.gemini import get_gemini_llm

async def digital_twin_agent(state: UnifiedState, datastore: Datastore) -> Dict[str, Any]:
    """
    Agent responsible for Digital Twin predictions and simulations via LLM interpretation.
    """
    # Mock simulation parameters
    location = "Urban Center"
    
    # In reality, this would run a complex model
    simulation_result = {
        "scenario": "Traffic Reduction",
        "impact": "Carbon emission reduced by 15%",
        "confidence": 0.85,
        "details": "Reduction in NOx levels by 10% expected within 2 weeks."
    }
    
    llm = get_gemini_llm()
    
    if not llm:
         return {
            "structured_data": {"simulation_result": simulation_result},
            "messages": [AIMessage(content=f"Simulation Result: {simulation_result}")]
        }
        
    prompt = (
        f"You are a Digital Twin interface. Interpret the following simulation result for the user:\n"
        f"Scenario: {simulation_result['scenario']}\n"
        f"Data: {simulation_result}\n\n"
        "Explain the impact in simple terms and highlight the confidence level."
    )
    
    try:
        response = await llm.ainvoke([SystemMessage(content=prompt)])
        return {
            "structured_data": {"simulation_result": simulation_result},
            "messages": [response]
        }
    except Exception as e:
         return {
            "structured_data": {"error": str(e)},
            "messages": [AIMessage(content="Error interpreting simulation.")]
        }

