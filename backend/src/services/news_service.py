import os
import requests
import json
from typing import List, Dict
from src.core.cache import get_cache, set_cache
from src.llm.gemini import get_gemini_llm
from langchain_core.messages import HumanMessage
from src.services.tavily_service import tavily_service

CACHE_KEY = "global_enriched_news_v1"
CACHE_TTL = 3600  # 1 hour

GENERIC_NEWS_PROMPT = """You are an Environmental Intelligence Assistant.

Your task is to analyze environmental news articles and extract/generate the following for EACH article:
1. headline: The title of the article.
2. summary_simple: A quick, easy-to-understand summary.
3. why_it_matters: The environmental impact.
4. actionable_steps: 2-3 bullet points on what ANY user could do with this information.
5. impact_level: "low", "medium", or "high".

Provide ONLY a JSON array of objects with the exact keys above.
"""

class NewsService:
    async def fetch_environmental_news(self) -> List[Dict]:
        # 1. Check Redis Cache
        cached_news = await get_cache(CACHE_KEY)
        if cached_news:
            import logging
            logger = logging.getLogger(__name__)
            logger.info("\n⚡🚀 [REDIS CACHE HIT] Served globally enriched news instantly!\n")
            return cached_news

        import logging
        logger = logging.getLogger(__name__)
        logger.info("\n🐌🌐 [API FETCH] Cache Miss. Fetching Top 10 News from Tavily and Enriching with LLM...\n")

        # 2. Fetch from Tavily Service
        extracted_news = tavily_service.search_news()
        
        if not extracted_news:
            return []

        # 3. Enrich with LLM
        enriched_news = []
        try:
            llm = get_gemini_llm()
            if not llm:
                print("Gemini LLM returned None. Need GOOGLE_API_KEY.")
                return extracted_news

            prompt = f"{GENERIC_NEWS_PROMPT}\n\nRAW NEWS ARTICLES:\n{json.dumps(extracted_news, indent=2)}"
            
            response = await llm.ainvoke([HumanMessage(content=prompt)])
            
            response_text = response.content.strip()
            
            # Clean Markdown formatting around json
            if response_text.startswith("```json"):
                response_text = response_text[7:-3].strip()
            elif response_text.startswith("```"):
                response_text = response_text[3:-3].strip()
                
            enriched_news = json.loads(response_text)
        except Exception as parse_e:
            print(f"Error enriching news via Langchain/Gemini: {parse_e}")
            return extracted_news # Fallback to raw news if LLM parsing fails

        # 4. Store in Redis
        if enriched_news:
            await set_cache(CACHE_KEY, enriched_news, ttl=CACHE_TTL)
            
        return enriched_news

news_service = NewsService()
