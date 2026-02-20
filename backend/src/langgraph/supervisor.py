from typing import Dict, Any
from langchain_core.messages import HumanMessage
from src.langgraph.state import UnifiedState
from loguru import logger


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

        if user_id and lat is not None and lon is not None:
            try:
                twin_context = await datastore.build_full_context(
                    user_id=user_id,
                    lat=lat,
                    lon=lon
                )

                if twin_context:
                    structured_data.update(twin_context)

            except Exception as e:
                logger.warning(f"Twin context build failed: {e}")

        # --------------------------------------------------
        # 2️⃣ Extract Last Message
        # --------------------------------------------------

        if not state.get("messages"):
            return {
                "next_agent": "chatbot",
                "structured_data": structured_data
            }

        last_message = state["messages"][-1]

        if not isinstance(last_message, HumanMessage):
            return {
                "next_agent": "chatbot",
                "structured_data": structured_data
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

        # For demo simplicity: always route to chatbot.
        # Future: you can add intelligent routing logic here.

        return {
            "next_agent": "chatbot",
            "structured_data": structured_data
        }

    except Exception as e:
        logger.error(f"Supervisor fatal error: {e}")

        return {
            "next_agent": "chatbot",
            "structured_data": state.get("structured_data", {}),
            "error": str(e)
        }