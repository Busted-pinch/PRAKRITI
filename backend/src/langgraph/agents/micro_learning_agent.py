from typing import Dict, Any
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage
from src.langgraph.state import UnifiedState
from src.llm.factory import get_llm


async def micro_learning_agent(state: UnifiedState, datastore: Any) -> Dict[str, Any]:

    structured = state.get("structured_data", {})

    twin = structured.get("twin_state", {})
    environment = structured.get("environment", {})
    behavior_profile = structured.get("behavior_profile", {})
    counterfactual = structured.get("counterfactual_simulation")

    risk_level = twin.get("risk_category")
    primary_driver = twin.get("primary_risk_driver")
    projection = twin.get("projection_7d", [])
    conflict = twin.get("behavior_environment_conflict", {})
    interest_vector = behavior_profile.get("interest_vector", {})

    llm = get_llm(provider="groq")

    if not llm:
        return {
            "messages": [
                AIMessage(content="Environmental awareness tip unavailable.")
            ]
        }

    # ---------------------------------------
    # Determine Tone Based on Risk
    # ---------------------------------------

    if risk_level == "high":
        tone = "urgent but calm"
    elif risk_level == "moderate":
        tone = "advisory and preventive"
    else:
        tone = "encouraging and reinforcing"

    # ---------------------------------------
    # Determine Interest Focus
    # ---------------------------------------

    if interest_vector:
        top_interest = max(interest_vector, key=interest_vector.get)
    else:
        top_interest = "general sustainability"

    # ---------------------------------------
    # Trend Awareness
    # ---------------------------------------

    trend_direction = "stable"

    if len(projection) >= 2:
        if projection[-1] > projection[0]:
            trend_direction = "worsening"
        elif projection[-1] < projection[0]:
            trend_direction = "improving"

    # ---------------------------------------
    # Conflict Awareness
    # ---------------------------------------

    conflict_text = ""
    if conflict.get("conflict"):
        conflict_text = f"There is a behavioral-environment mismatch: {conflict.get('reason')}."

    # ---------------------------------------
    # Counterfactual Awareness
    # ---------------------------------------

    counterfactual_text = ""
    if counterfactual:
        counterfactual_text = f"Simulation result: {counterfactual}"

    # ---------------------------------------
    # Build LLM Prompt
    # ---------------------------------------

    system_prompt = f"""
    You are an adaptive environmental educator.

    Tone: {tone}
    Risk Level: {risk_level}
    Primary Risk Driver: {primary_driver}
    Trend Direction: {trend_direction}
    Top User Interest: {top_interest}

    {conflict_text}
    {counterfactual_text}

    Generate:
    1. One short educational insight (max 2 sentences)
    2. One practical action aligned with user's interests
    3. Reinforce long-term behavior improvement
    """

    response = await llm.ainvoke([
        SystemMessage(content=system_prompt)
    ])

    return {
        "structured_data": {
            "microlearning": {
                "risk_level": risk_level,
                "driver": primary_driver,
                "interest_focus": top_interest
            }
        },
        "messages": [response]
    }