from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from src.api.deps import get_current_user
from src.core.aggregate_data import AggregateData
from src.services.news_service import news_service
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
async def get_personalized_news(current_user: dict = Depends(get_current_user)):
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

    # 3. Fetch Globally Enriched News (Cache or LLM + Tavily)
    enriched_news = await news_service.fetch_environmental_news()

    if not enriched_news:
        return NewsResponse(articles=[])

    # 4. Build Response
    items = []
    for item in enriched_news:
        try:
            items.append(NewsItem(**item))
        except Exception as e:
            print(f"Skipping malformed LLM response item: {e}")

    return NewsResponse(articles=items)

