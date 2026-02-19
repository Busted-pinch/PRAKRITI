from typing import List, Dict, Any, Callable
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import JsonOutputParser
from src.langgraph.state import UnifiedState
from src.llm.gemini import get_gemini_llm
import json
from loguru import logger

# Registry to hold available agents and their descriptions
AGENT_REGISTRY = {
    "environment_analyst": {
        "description": "Analyzes weather, climate, and environmental data for a location. Use this for queries about weather, air quality, AQI, pollution, or climate stats.",
    },
    "digital_twin": {
        "description": "Runs simulations and predictions for urban planning and environmental impact. Use this for 'simulate', 'predict', 'what if' scenarios regarding traffic, emissions, or urban changes.",
    },
    "micro_learner": {
        "description": "Provides personalized learning content and tips. Use this when the user asks to learn something, wants a tip, or asks for facts about sustainability.",
    },
    "chatbot": {
        "description": "Handles general conversation, greetings, and queries not covered by other agents. Also use this if the user wants to end the conversation.",
    }
}

async def supervisor_agent(state: UnifiedState, datastore: Any) -> Dict[str, Any]:
    """
    The Supervisor Agent that orchestrates the workflow using LLM.
    """
    logger.info("Supervisor: routing user request")
    messages = state["messages"]
    last_message = messages[-1]
    
    # Validation: If last message is from Assistant (Agent), we probably finish or ask user
    if not isinstance(last_message, HumanMessage):
        logger.debug("Supervisor: Last message was not human, finishing turn")
        return {"next_agent": "FINISH"}

    llm = get_gemini_llm()
    
    # Fallback to keyword matching query if LLM is not available
    if not llm:
        logger.warning("Supervisor: LLM not available, using fallback")
        # ... (Fallback logic details omitted for brevity, defaulting to chatbot) ...
        return {"next_agent": "chatbot"}

    # Construct Agent Descriptions for Prompt
    agents_desc = "\n".join([f"- {name}: {info['description']}" for name, info in AGENT_REGISTRY.items()])
    
    system_prompt = (
        "You are the Supervisor of an intelligent environmental system.\n"
        "Your goal is to route the user's request to the most appropriate agent.\n"
        f"Available Agents:\n{agents_desc}\n\n"
        "Rules:\n"
        "1. Return ONLY a JSON object with a single key 'next_agent'.\n"
        "2. The value must be one of the agent names listed above, or 'FINISH' if the conversation is done.\n"
        "3. If the user's intent is unclear or general, route to 'chatbot'.\n"
        "4. Do not add any markdown formatting or explanations."
    )
    
    try:
        logger.info("Supervisor: Invoking LLM for routing")
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            last_message
        ])
        
        content = response.content.strip()
        # Clean potential markdown code blocks
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
            
        decision = json.loads(content)
        next_agent = decision.get("next_agent", "chatbot")
        
        # Verify agent exists
        if next_agent not in AGENT_REGISTRY and next_agent != "FINISH":
            logger.warning(f"Supervisor: Invalid agent '{next_agent}' selected by LLM. Defaulting to chatbot.")
            next_agent = "chatbot"
        else:
            logger.info(f"Supervisor: Routed to {next_agent}")
            
    except Exception as e:
        logger.error(f"Supervisor Error: {e}")
        next_agent = "chatbot"

    return {"next_agent": next_agent}
