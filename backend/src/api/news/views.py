from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from src.api.deps import get_current_user
from src.api.user.views import USER_DB  # Import mock DB to fetch profile
from src.services.news_service import news_service
from src.langgraph.agents.news_agent import process_news_for_user

router = APIRouter()

class NewsItem(BaseModel):
    headline: str
    summary_simple: str
    why_it_matters_to_you: str
    actionable_steps: List[str]
    impact_level: str
    confidence_score: int

class NewsResponse(BaseModel):
    articles: List[NewsItem]

@router.get("/personalized", response_model=NewsResponse)
async def get_personalized_news(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub") or current_user.get("id") if isinstance(current_user, dict) else current_user.id
    
    # 1. Get user profile
    profile = USER_DB.get(user_id)
    if not profile:
        profile = {
            "id": user_id,
            "persona": {"name": "Traveler"},
            "constraints": {"max_physical_intensity": "med", "aqi_sensitivity": "med"},
            "diseases": [],
            "hobbies": []
        }

    # 2. Mock environment context (in production fetch this dynamically)
    # Using the prompt structure from the user
    environment_context = {
        "current_aqi": 180,
        "pm2_5": 95,
        "temperature": 32
    }

    # 3. Fetch raw news
    raw_news = news_service.fetch_environmental_news()

    if not raw_news:
        return NewsResponse(articles=[])

    # 4. RAG / Process via LLM
    structured_news = process_news_for_user(
        user_profile=profile,
        environment_context=environment_context,
        raw_news=raw_news
    )

    # 5. Build Response
    items = []
    for item in structured_news:
        try:
            items.append(NewsItem(**item))
        except Exception as e:
            print(f"Skipping malformed LLM response item: {e}")

    return NewsResponse(articles=items)

