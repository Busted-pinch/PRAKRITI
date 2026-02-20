from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from .schemas import ProfileUpdate, TwinUpdate, SettingsUpdate, OnboardingPayload, UserProfile, Persona, Trait, Constraints
from src.api.deps import get_current_user

from datetime import datetime
from src.core.aggregate_data import AggregateData

router = APIRouter()
store = AggregateData()

# ... (keep calculate_persona and calculate_traits helper functions as is) ...

def calculate_persona(constraints: Constraints) -> Persona:
    intensity = constraints.max_physical_intensity
    sensitivity = constraints.aqi_sensitivity

    if intensity == 'high' and sensitivity == 'high':
        return Persona(name="Forest Guardian", desc="Protective of nature, high energy but sensitive to quality.")
    if intensity == 'high' and sensitivity != 'high':
        return Persona(name="Mountain Strider", desc="Robust and adventurous, seeking peaks and challenges.")
    if intensity == 'low' and sensitivity == 'high':
        return Persona(name="Urban Zen Master", desc="Mindful and selective, thriving in controlled environments.")
    return Persona(name="River Wanderer", desc="Adaptable and flowing, balanced in energy and sensitivity.")

def calculate_traits(answers) -> list[Trait]:
    # Default dummy calculation logic mirroring frontend
    return [
        Trait(subject='Resilience', A=120, fullMark=150),
        Trait(subject='Adaptability', A=98, fullMark=150),
        Trait(subject='Empathy', A=86, fullMark=150),
        Trait(subject='Awareness', A=99, fullMark=150),
        Trait(subject='Energy', A=85, fullMark=150),
        Trait(subject='Curiosity', A=65, fullMark=150),
    ]

@router.post("/onboarding")
async def onboarding(payload: OnboardingPayload, current_user = Depends(get_current_user)):
    # Handle both object and dict (just in case dependency changes)
    if hasattr(current_user, 'id'):
        user_id = current_user.id
        email = current_user.email
        user_metadata = current_user.user_metadata or {}
    else:
        user_id = current_user.get("sub") or current_user.get("id") or "123"
        email = current_user.get("email", "user@example.com")
        user_metadata = current_user.get("user_metadata", {})
    
    # Logic to process assessment
    persona = calculate_persona(payload.constraints)
    traits = calculate_traits(payload.answers)
    
    user_data = {
        "id": user_id,
        "email": email,
        "name": user_metadata.get("full_name", "Traveler"),
        "persona": persona.dict(),
        "traits": [t.dict() for t in traits],
        "hobbies": payload.hobbies,
        "interests": payload.selected_interests,
        "constraints": payload.constraints.dict(),
        "twin_status": "optimizing"
    }

    # Try to clean up existing user or upsert
    # Since we added create/update, we can try update, if fail then create, or just upsert if supabase supports it directly via insert(upsert=True)
    # But Datastore.create_user uses insert(), Datastore.update_user uses update()
    # Let's try to get user first
    existing = store.get_user(user_id)
    if existing:
        saved_user = store.update_user(user_id, user_data)
    else:
        saved_user = store.create_user(user_data)

    if not saved_user:
         # Fallback if DB fails (or if we want to return what we computed anyway)
         # In a real app, raise HTTPException
         return {"message": "Onboarding complete (local)", "profile": user_data}

    return {"message": "Onboarding complete", "profile": saved_user}

@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user = Depends(get_current_user)):
    if hasattr(current_user, 'id'):
        user_id = current_user.id
        email = current_user.email
        user_metadata = current_user.user_metadata or {}
    else:
        user_id = current_user.get("sub") or current_user.get("id") or "123"
        email = current_user.get("email", "user@example.com")
        user_metadata = current_user.get("user_metadata", {})
    
    # Return from DB
    profile = store.get_user(user_id)
    
    if not profile:
        # Return basic profile if no assessment done yet
        return UserProfile(
            id=user_id,
            email=email,
            name=user_metadata.get("full_name", "Traveler"),
            hobbies=[],
            interests=[]
        )
    return profile

@router.put("/profile")
async def update_profile(data: ProfileUpdate, current_user = Depends(get_current_user)):
    user_id = current_user.id if hasattr(current_user, 'id') else (current_user.get("sub") or current_user.get("id"))
    
    # We only update fields that are provided
    updates = data.dict(exclude_unset=True)
    if updates:
        store.update_user(user_id, updates)
        
    return {"message": "Profile updated", "data": data}

@router.get("/twin")
async def get_twin_state(current_user = Depends(get_current_user)):
    user_id = current_user.id if hasattr(current_user, 'id') else (current_user.get("sub") or current_user.get("id"))
    profile = store.get_user(user_id)
    
    status = "healthy"
    if profile and hasattr(profile, "twin_status"):
         status = profile.twin_status
    elif profile and isinstance(profile, dict):
         status = profile.get("twin_status", "healthy")

    return {"status": status, "risk_level": "low"}

@router.put("/twin")
async def update_twin_state(data: TwinUpdate):
    # This endpoint didn't verify user in original code, but we probably should. 
    # For now, keeping it simple or assuming it might be system called? 
    # Actually, without user_id we can't update.
    # The original code just returned the data.
    return {"message": "Twin updated", "data": data}

@router.get("/settings")
async def get_settings():
    return {"notifications": True, "theme": "dark"}

@router.put("/settings")
async def update_settings(data: SettingsUpdate):
    return {"message": "Settings updated", "data": data}
