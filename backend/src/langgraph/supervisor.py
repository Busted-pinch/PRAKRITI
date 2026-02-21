from typing import Dict, Any
from langchain_core.messages import HumanMessage
from src.langgraph.state import UnifiedState
from src.llm.factory import get_llm
from loguru import logger
import json


async def supervisor_agent(
    state: UnifiedState,
    datastore: Any
) -> Dict[str, Any]:
    """
    Supervisor Agent

    Responsibilities:
    1. Inject full deterministic digital twin context before routing.
    2. Detect hypothetical queries and run counterfactual simulation.
    3. Route safely to chatbot (or future agents).
    """

    try:
        user_id = state.get("user_id")
        lat = state.get("lat")
        lon = state.get("lon")

        structured_data = state.get("structured_data") or {}

        # --------------------------------------------------
        # 1️⃣ Inject Full Digital Twin Context
        # --------------------------------------------------

        if user_id:
            try:
                # Always fetch behavior profile if we have a user
                behavior = await datastore.get_behavior_profile(user_id)
                if behavior:
                    if "behavior_profile" not in structured_data:
                        structured_data["behavior_profile"] = behavior

                # Only fetch environment & full twin context if we have location
                if lat is not None and lon is not None:
                    twin_context = await datastore.build_full_context(
                        user_id=user_id,
                        lat=lat,
                        lon=lon
                    )
                    if twin_context:
                        structured_data.update(twin_context)
                else:
                    # If no lat/lon but we have behavior, inject just the behavior for the LLM
                    if "llm_context" not in structured_data:
                        structured_data["llm_context"] = {}
                    structured_data["llm_context"]["behavior"] = behavior

            except Exception as e:
                logger.warning(f"Twin context build failed: {e}")

        # --------------------------------------------------
        # 2️⃣ Extract Last Message
        # --------------------------------------------------

        if not state.get("messages"):
            return {
                "next_agent": "chatbot",
                "structured_data": structured_data,
                "lat": lat,
                "lon": lon
            }

        last_message = state["messages"][-1]

        if not isinstance(last_message, HumanMessage):
            return {
                "next_agent": "chatbot",
                "structured_data": structured_data,
                "lat": lat,
                "lon": lon
            }

        query = (last_message.content or "").lower()

        # --------------------------------------------------
        # 3️⃣ Detect Hypothetical / Counterfactual Queries
        # --------------------------------------------------

        hypothetical_triggers = [
            "what if",
            "suppose",
            "if i",
            "imagine",
            "hypothetically"
        ]

        is_hypothetical = any(trigger in query for trigger in hypothetical_triggers)

        if is_hypothetical:
            try:
                environment = structured_data.get("environment", {})
                behavior_profile = structured_data.get("behavior_profile", {})
                behavior = behavior_profile.get("behavior_model", {})
                health = behavior_profile.get("health_profile", {})

                env_override: Dict[str, Any] = {}

                # Example override logic
                if "double aqi" in query:
                    current_pm25 = environment.get("pm2_5") or 0
                    env_override["pm2_5"] = current_pm25 * 2

                if "increase pollution" in query:
                    current_pm25 = environment.get("pm2_5") or 0
                    env_override["pm2_5"] = current_pm25 * 1.5

                if "zero pollution" in query:
                    env_override["pm2_5"] = 0

                # Run deterministic simulation safely
                if hasattr(datastore, "twin_engine") and datastore.twin_engine:
                    simulated = datastore.twin_engine.simulate(
                        environment=environment,
                        behavior=behavior,
                        health=health,
                        env_override=env_override
                    )

                    structured_data["counterfactual_simulation"] = simulated

            except Exception as e:
                logger.warning(f"Counterfactual simulation failed: {e}")

        # --------------------------------------------------
        # 4️⃣ Final Routing
        # --------------------------------------------------

        llm = get_llm(provider="grok", temperature=0.1)
        next_agent = "chatbot" # Default fallback

        if llm:
            routing_prompt = f"""
            Analyze the user's query and classify it into one of three exactly-spelled agent categories:

            1. "environment_analyst": The user is asking for deep environmental analysis, current AQI breakdowns, weather impacts, or complex data about their surroundings.
            2. "micro_learner": The user is asking to "learn", "teach me", "what is", or wants general environmental education/definitions.
            3. "chatbot": The user is making casual conversation, asking standard questions, or doesn't fit the above two.

            USER QUERY: "{query}"

            Return ONLY a JSON object with a single key "agent".
            Example: {{"agent": "environment_analyst"}}
            """
            
            try:
                response = await llm.ainvoke([HumanMessage(content=routing_prompt)])
                response_text = response.content.strip()
                if response_text.startswith("```json"):
                    response_text = response_text[7:-3].strip()
                elif response_text.startswith("```"):
                    response_text = response_text[3:-3].strip()
                    
                parsed = json.loads(response_text)
                selected = parsed.get("agent")
                if selected in ["environment_analyst", "micro_learner", "chatbot"]:
                    next_agent = selected
            except Exception as e:
                logger.warning(f"Intelligent routing failed, falling back to chatbot: {e}")

        logger.info(f"Supervisor Routing Query to: {next_agent}")

        return {
            "next_agent": next_agent,
            "structured_data": structured_data,
            "lat": lat,
            "lon": lon
        }

    except Exception as e:
        logger.error(f"Supervisor fatal error: {e}")

        return {
            "next_agent": "chatbot",
            "structured_data": state.get("structured_data", {}),
            "lat": state.get("lat"),
            "lon": state.get("lon"),
            "error": str(e)
        }