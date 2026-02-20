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
    
    # Profile updates (name only usually)
    existing_profile = store.get_user(user_id)
    profile_updates = {"name": user_metadata.get("full_name", "Traveler")}
    if existing_profile:
        store.update_user(user_id, profile_updates)
    else:
        store.create_user({"id": user_id, **profile_updates})

    # Behavior profile
    behavior_data = {
        "behavior_model": {
            "persona": persona.dict(),
            "traits": [t.dict() for t in traits],
            "twin_status": "optimizing"
        },
        "mbti": persona.name, # Using persona name as placeholder for MBTI
        "selected_interests": payload.selected_interests,
        "hobbies": payload.hobbies,
        "diseases": payload.diseases,
        "constraints": payload.constraints.dict(),
    }
    
    saved_behavior = store.upsert_behavior_profile(user_id, behavior_data)

    user_profile = UserProfile(
        id=user_id,
        email=email,
        name=profile_updates["name"],
        persona=persona,
        traits=traits,
        hobbies=payload.hobbies,
        interests=payload.selected_interests,
        constraints=payload.constraints,
        twin_status="optimizing"
    )

    return {"message": "Onboarding complete", "profile": user_profile.dict()}

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
    behavior = store.get_raw_behavior_profile(user_id)
    
    name = user_metadata.get("full_name", "Traveler")
    
    if profile and hasattr(profile, 'name') and profile.name:
        name = profile.name
        
    hobbies = []
    interests = []
    persona = None
    traits = None
    constraints = None
    twin_status = "healthy"
    
    if behavior:
        hobbies = behavior.get("hobbies", [])
        interests = behavior.get("selected_interests", [])
        if behavior.get("constraints"):
            constraints = Constraints(**behavior["constraints"])
        behavior_model = behavior.get("behavior_model", {})
        if behavior_model.get("persona"):
            persona = Persona(**behavior_model["persona"])
        if behavior_model.get("traits"):
            traits = [Trait(**t) for t in behavior_model["traits"]]
        twin_status = behavior_model.get("twin_status", "healthy")
        
    return UserProfile(
        id=user_id,
        email=email,
        name=name,
        hobbies=hobbies,
        interests=interests,
        persona=persona,
        traits=traits,
        constraints=constraints,
        twin_status=twin_status
    )

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
