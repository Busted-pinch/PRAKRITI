import os
import requests
import json
from typing import List, Dict
from src.core.cache import get_cache, set_cache
from src.llm.factory import get_llm
from langchain_core.messages import HumanMessage
from src.services.tavily_service import tavily_service
from src.core.supabase_client import supabase

# We will lazy-load the embedding model so it doesn't block the backend startup
embedding_model = None

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
    def get_embedding(self, text: str) -> List[float]:
        """Generates a 384-dimensional vector embedding using a local HuggingFace model."""
        global embedding_model
        try:
            if embedding_model is None:
                print("\n[INFO] Loading local embedding model (all-MiniLM-L6-v2) for the first time...")
                print("[INFO] This might take a minute if it needs to download weights from HuggingFace.")
                from sentence_transformers import SentenceTransformer
                embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
                print("[INFO] Local embedding model loaded successfully!\n")

            # The model returns a numpy array, convert to standard python float list for DB
            embedding_array = embedding_model.encode(text)
            return embedding_array.tolist()
        except Exception as e:
            print(f"Error generating local embedding: {e}")
            return []

    async def fetch_and_ingest_news(self) -> bool:
        """Fetches from Tavily, enriches via LLM, embeds, and stores in Supabase."""
        # 1. Fetch from Tavily Service
        extracted_news = tavily_service.search_news()
        
        if not extracted_news:
            return []

        # 3. Enrich with LLM
        enriched_news = []
        try:
            llm = get_llm(provider="groq", temperature=0.2)
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
            return False

        # 4. Embed and Store in Supabase
        if enriched_news:
            for item in enriched_news:
                # Create a rich text representation for the embedding
                combined_text = f"Headline: {item.get('headline', '')}\nSummary: {item.get('summary_simple', '')}\nImpact: {item.get('why_it_matters', '')}"
                embedding = self.get_embedding(combined_text)
                
                if embedding:
                    try:
                        # Find original source from tavily results
                        source = "Global News"
                        for raw in extracted_news:
                            if raw.get('title', '')[:20] in item.get('headline', '') or item.get('headline', '')[:20] in raw.get('title', ''):
                                source = raw.get('source', '')
                                break
                                
                        data = {
                            "title": item.get('headline', ''),
                            "content": combined_text,
                            "source": source,
                            "summary": item.get('summary_simple', ''),
                            "impact_level": item.get('impact_level', 'medium'),
                            "why_it_matters": item.get('why_it_matters', ''),
                            "actionable_steps": item.get('actionable_steps', []),
                            "embedding": embedding
                        }
                        supabase.table("news_articles").insert(data).execute()
                    except Exception as e:
                        print(f"Error inserting news to Supabase: {e}")
                        
            # Update cache to prevent spamming Tavily
            await set_cache(CACHE_KEY, "ingested", ttl=CACHE_TTL)
            return True
        return False

news_service = NewsService()
