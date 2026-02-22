from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json

from src.api.deps import get_current_user
from src.core.aggregate_data import AggregateData
from src.services.news_service import news_service, CACHE_KEY_PREFIX
from src.core.supabase_client import supabase
from src.core.cache import get_cache
from src.langgraph.agents.news_agent import process_news_for_user

router = APIRouter()

class NewsItem(BaseModel):
    headline: str
    summary_simple: str
    why_it_matters: str
    actionable_steps: List[str]
    impact_level: str

class NewsResponse(BaseModel):
    articles: List[NewsItem]

@router.get("/personalized", response_model=NewsResponse)
async def get_personalized_news(
    location: str = "global", 
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("sub") or current_user.get("id") if isinstance(current_user, dict) else current_user.id
    
    # 1. Get user profile
    store = AggregateData()
    profile = store.get_user(user_id)
    behavior = store.get_raw_behavior_profile(user_id) or {}

    profile_data = {
        "id": user_id,
        "persona": behavior.get("behavior_model", {}).get("persona", {"name": "Traveler"}),
        "constraints": behavior.get("constraints", {"max_physical_intensity": "med", "aqi_sensitivity": "med"}),
        "diseases": behavior.get("diseases", []),
        "hobbies": behavior.get("hobbies", [])
    }

    # 2. Mock environment context (in production fetch this dynamically)
    # Using the prompt structure from the user
    environment_context = {
        "current_aqi": 180,
        "pm2_5": 95,
        "temperature": 32
    }

    # 3. Ingest News if not cached
    location_key = location.lower().replace(" ", "_")
    cache_key = f"{CACHE_KEY_PREFIX}_{location_key}"
    if not await get_cache(cache_key):
        print(f"News cache missing for {location}, triggering background ingestion...")
        await news_service.fetch_and_ingest_news(location_focus=location)

    # 4. RAG Semantic Search
    try:
        # Create a semantic string representing what this user cares about
        location_prefix = "Global Context" if location.lower() == "global" else f"Local Context ({location})"
        user_query = f"{location_prefix}. User Persona: {profile_data['persona']['name']}. " \
                     f"Health conditions: {', '.join(profile_data['diseases'])}. " \
                     f"Constraints: {json.dumps(profile_data['constraints'])}. " \
                     f"Hobbies: {', '.join(profile_data['hobbies'])}."
                     
        query_embedding = news_service.get_embedding(user_query)
        
        if not query_embedding:
            return NewsResponse(articles=[])

        # Search Supabase vector DB
        response = supabase.rpc("match_news_articles", {
            "query_embedding": query_embedding,
            "match_threshold": 0.0, # Lowered from 0.3 to 0.0 since local embeddings have different similarity ranges
            "match_count": 10
        }).execute()

        matched_data = response.data or []
        print(f"RAG retrieved {len(matched_data)} articles for user {user_id}")
        
        items = []
        for row in matched_data:
            items.append(NewsItem(
                headline=row.get("title", ""),
                summary_simple=row.get("summary", ""),
                why_it_matters=row.get("why_it_matters", ""),
                actionable_steps=row.get("actionable_steps", []),
                impact_level=row.get("impact_level", "medium")
            ))
            
        return NewsResponse(articles=items)

    except Exception as e:
        print(f"[News API] RAG Semantic Search failed: {e}")
        return NewsResponse(articles=[])

