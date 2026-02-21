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
    type: Optional[str] = None                    # 'national' or 'international'
    why_it_matters_to_user: Optional[str] = None  # personalized relevance
    actionable_steps: Optional[List[str]] = None  # list of action strings
    source: Optional[str] = None                  # URL to official source

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

    # 2. Fetch raw laws (all columns from Supabase)
    raw_laws = await law_service.fetch_environmental_laws()

    if not raw_laws:
        return LawResponse(laws=[])

    # 3. Map all available fields to the response schema
    items = []
    for law in raw_laws:
        try:
            raw_text = law.get("raw_text", "")
            # Use summary if available, else truncate raw_text as fallback
            summary = (
                law.get("summary_simple")
                or law.get("summary")
                or (raw_text[:300] + "…" if len(raw_text) > 300 else raw_text)
            )

            # actionable_steps: accept list or pipe-delimited string
            steps = law.get("actionable_steps") or []
            if isinstance(steps, str):
                steps = [s.strip() for s in steps.split("|") if s.strip()]

            items.append(LawItem(
                title=law.get("title", "Untitled Law"),
                summary_simple=summary,
                category=law.get("category"),
                type=law.get("type"),
                why_it_matters_to_user=law.get("why_it_matters_to_user") or law.get("why_it_matters"),
                actionable_steps=steps,
                source=law.get("source") or law.get("source_url"),
            ))
        except Exception as e:
            print(f"Skipping malformed law item: {e}")

    return LawResponse(laws=items)
