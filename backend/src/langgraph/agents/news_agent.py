import os
import json
from src.llm.factory import get_llm

# Local dictionary cache for user-processed news
# Keys are user_id, values are {"data": [...], "timestamp": ...}
_USER_NEWS_CACHE = {}
USER_CACHE_TTL = 10 * 60  # 10 minutes

NEWS_SYSTEM_PROMPT = """You are an Environmental Intelligence Assistant.

Your task is to convert environmental news into:
1. Clear simplified explanation
2. Personalized relevance analysis
3. Actionable citizen-level recommendations

STRICT RULES:
- Do NOT hallucinate facts.
- Only use provided article content.
- If data missing, say "Insufficient information."
- Keep language simple.
- Avoid technical jargon.
- Maximum 120 words per section.
- Provide structured JSON output only conforming to the requested schema.
"""

def process_news_for_user(user_profile: dict, environment_context: dict, raw_news: list) -> list:
    """
    Processes a list of raw news articles through the LLM to generate personalized news intelligence.
    Employs a simple mock vectorization approach since full Databricks setup is not yet guaranteed.
    """
    global _USER_NEWS_CACHE
    import time
    user_id = user_profile.get("id", "unknown")
    current_time = time.time()
    
    # Check cache
    cached_data = _USER_NEWS_CACHE.get(user_id)
    if cached_data and (current_time - cached_data["timestamp"] < USER_CACHE_TTL):
        return cached_data["data"]

    # Basic retrieval / filtering - grab top 4 to limit LLM payload
    # In a full Databricks Mosaic VectorStore, we would embed user context and news and do cosine similarity search.
    selected_news = raw_news[:4]
    
    processed_news = []
    
    # Clean up user profile for LLM to avoid sending massive objects
    clean_profile = {
        "risk_tolerance": user_profile.get("constraints", {}).get("max_physical_intensity", "medium"),
        "health_conditions": user_profile.get("diseases", []),
        "hobbies": user_profile.get("hobbies", []),
        "persona_type": user_profile.get("persona", {}).get("name", "Traveler")
    }

    try:
        model = get_llm(provider="groq")
        # We request structured output via prompt instructions.
        
        for article in selected_news:
            prompt_context = {
                "user_profile": clean_profile,
                "environment_context": environment_context,
                "news_article": article
            }
            
            prompt = f"""
            {NEWS_SYSTEM_PROMPT}
            
            USER CONTEXT INPUT (Structured):
            {json.dumps(prompt_context, indent=2)}
            
            REQUIRED OUTPUT FORMAT:
            {{
              "headline": "",
              "summary_simple": "",
              "why_it_matters_to_you": "",
              "actionable_steps": [
                "",
                "",
                ""
              ],
              "impact_level": "low | medium | high",
              "confidence_score": 0-100
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
                processed_news.append(result)
            except Exception as parse_e:
                print(f"Error parsing JSON from LLM: {parse_e}")

    except Exception as e:
        print(f"News Processing Error: {e}")
        # Return graceful degradation fallback
        return []

    # Save to user cache
    _USER_NEWS_CACHE[user_id] = {
        "data": processed_news,
        "timestamp": current_time
    }
    
    return processed_news
