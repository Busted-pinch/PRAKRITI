from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

from src.api.deps import get_current_user
from src.core.aggregate_data import AggregateData
from src.services.law_service import law_service
from src.langgraph.agents.law_agent import process_laws_for_user

router = APIRouter()

class LawItem(BaseModel):
    title: str
    summary_simple: str
    why_it_matters_to_user: str
    actionable_steps: List[str]
    source: str
    confidence_score: int
    category: str
    type: str

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
    raw_laws = law_service.fetch_environmental_laws()

    if not raw_laws:
        return LawResponse(laws=[])

    # 3. Process via LLM
    structured_laws = process_laws_for_user(
        user_profile=profile_data,
        raw_laws=raw_laws
    )

    # 4. Build Response
    items = []
    for item in structured_laws:
        try:
            items.append(LawItem(**item))
        except Exception as e:
            print(f"Skipping malformed LLM response item: {e}")

    return LawResponse(laws=items)
