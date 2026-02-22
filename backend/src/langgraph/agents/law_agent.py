import json
from src.llm.factory import get_llm

_USER_LAW_CACHE = {}
USER_CACHE_TTL = 60 * 60  # 1 hour to reduce LLM load on laws since they don't change fast

LAW_SYSTEM_PROMPT = """You are an Environmental Laws & Agreements Intelligence Assistant.

Your task:
1. Convert raw law/legislation text into simple language
2. Explain its core premise concisely

Rules:
- Simplify, no jargon
- Always return JSON with fields exactly as requested
- Maximum 80 words for the summary.
"""

def process_laws_for_user(user_profile: dict, raw_laws: list) -> list:
    global _USER_LAW_CACHE
    import time
    user_id = user_profile.get("id", "unknown")
    current_time = time.time()
    
    # Check cache
    cached_data = _USER_LAW_CACHE.get(user_id)
    if cached_data and (current_time - cached_data["timestamp"] < USER_CACHE_TTL):
        return cached_data["data"]

    processed_laws = []
    
    clean_profile = {
        "risk_tolerance": user_profile.get("constraints", {}).get("max_physical_intensity", "medium"),
        "health_conditions": user_profile.get("diseases", []),
        "persona_type": user_profile.get("persona", {}).get("name", "Traveler")
    }

    try:
        model = get_llm(provider="groq")
        for law in raw_laws:
            prompt_context = {
                "user_profile": clean_profile,
                "law_text": law.get("raw_text", "")
            }
            
            prompt = f"""
            {LAW_SYSTEM_PROMPT}
            
            USER CONTEXT INPUT (Structured):
            {json.dumps(prompt_context, indent=2)}
            
            REQUIRED OUTPUT FORMAT:
            {{
              "title": "{law.get('title', '')}",
              "summary_simple": ""
            }}
            """
            
            try:
                from langchain_core.messages import HumanMessage
                response = model.invoke([HumanMessage(content=prompt)])
                response_text = response.content.strip()
                if response_text.startswith("```json"):
                    response_text = response_text[7:-3].strip()
                elif response_text.startswith("```"):
                    response_text = response_text[3:-3].strip()
                    
                result = json.loads(response_text)
                # carry over frontend routing fields
                result["category"] = law.get("category", "regulation")
                processed_laws.append(result)
            except Exception as parse_e:
                print(f"Error parsing JSON from LLM: {parse_e}")

    except Exception as e:
        print(f"Law Processing Error: {e}")
        return []

    # Save to user cache
    _USER_LAW_CACHE[user_id] = {
        "data": processed_laws,
        "timestamp": current_time
    }
    
    return processed_laws
