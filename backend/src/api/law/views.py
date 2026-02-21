from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional

from src.api.deps import get_current_user
from src.core.aggregate_data import AggregateData
from src.services.law_service import law_service

router = APIRouter()

class LawItem(BaseModel):
    title: str
    summary_simple: str
    category: Optional[str] = None

class LawResponse(BaseModel):
    laws: List[LawItem]

@router.get("/personalized", response_model=LawResponse)
async def get_personalized_laws(current_user: dict = Depends(get_current_user)):
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

    # 2. Fetch raw laws
    raw_laws = await law_service.fetch_environmental_laws()

    if not raw_laws:
        return LawResponse(laws=[])

    # 3. Build Response directly from fetched data
    items = []
    for law in raw_laws:
        try:
            items.append(LawItem(
                title=law.get("title", ""),
                summary_simple=law.get("raw_text", "")[:200] + "..." if len(law.get("raw_text", "")) > 200 else law.get("raw_text", ""), # Use a snippet of raw text as a summary fallback
                category=law.get("category")
            ))
        except Exception as e:
            print(f"Skipping malformed data item: {e}")

    return LawResponse(laws=items)
