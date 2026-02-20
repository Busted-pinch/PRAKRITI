from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from .schemas import ProfileUpdate, TwinUpdate, SettingsUpdate, OnboardingPayload, UserProfile, Persona, Trait, Constraints
from src.api.deps import get_current_user

from datetime import datetime
from src.core.aggregate_data import AggregateData
from src.core.logger import logger

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

def calculate_traits(answers: list[int]) -> list[Trait]:
    # Mapping of question indices (0-9) to trait classes they affect.
    # We assign different weights or direct mapping based on user's Likert answers (1-5).
    trait_mapping = {
        "Resilience": [0, 8],     # Q1, Q9
        "Adaptability": [1, 5],   # Q2, Q6
        "Empathy": [2, 7],        # Q3, Q8
        "Awareness": [3, 9],      # Q4, Q10
        "Energy": [4, 6],         # Q5, Q7
        "Curiosity": [1, 3, 7]    # Mixed signals
    }
    
    # Calculate raw scores
    raw_scores = {trait: 0 for trait in trait_mapping}
    max_raw_scores = {trait: 0 for trait in trait_mapping}
    
    for trait, indices in trait_mapping.items():
        for idx in indices:
            if idx < len(answers) and answers[idx] is not None:
                raw_scores[trait] += answers[idx]
            else:
                raw_scores[trait] += 3 # default neutral
            # Since answers are 1-5
            max_raw_scores[trait] += 5

    # Normalize to a fullMark of 150 (frontend radar chart expectation)
    final_traits = []
    full_mark = 150
    for trait in trait_mapping.keys():
        # Protect against division by zero just in case
        max_possible = max_raw_scores[trait] if max_raw_scores[trait] > 0 else 1
        normalized_score = int((raw_scores[trait] / max_possible) * full_mark)
        final_traits.append(Trait(subject=trait, A=normalized_score, fullMark=full_mark))
        
    return final_traits

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
    
    logger.debug(f"[User API - Onboarding] Request received for user {user_id}.")

    # Logic to process assessment
    persona = calculate_persona(payload.constraints)
    traits = calculate_traits(payload.answers)
    
    # Profile updates (name only usually)
    existing_profile = store.get_user(user_id)
    profile_updates = {"full_name": user_metadata.get("full_name", "Traveler")}
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
        "interests": payload.selected_interests,
        "diseases": payload.diseases,
        "constraints": payload.constraints.dict(),
    }
    
    saved_behavior = store.upsert_behavior_profile(user_id, behavior_data)

    user_profile = UserProfile(
        id=user_id,
        email=email,
        name=profile_updates["full_name"],
        persona=persona,
        traits=traits,
        hobbies=payload.hobbies,
        interests=payload.selected_interests,
        constraints=payload.constraints,
        twin_status="optimizing"
    )

    logger.debug(f"[User API - Onboarding] Returning onboarding response for user {user_id}.")
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
        
    logger.debug(f"[User API - Profile] Returning constructed profile for {user_id}")
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
    if user_id in USER_DB:
        profile = USER_DB[user_id]
        if data.name is not None:
            profile["name"] = data.name
        if data.hobbies is not None:
            profile["hobbies"] = data.hobbies
        if data.interests is not None:
            profile["interests"] = data.interests
        if data.diseases is not None:
            profile["diseases"] = data.diseases
        if data.constraints is not None:
            profile["constraints"] = data.constraints.dict()
            # Recalculate persona when constraints change
            profile["persona"] = calculate_persona(data.constraints).dict()
        return {"message": "Profile updated", "profile": profile}
    
    raise HTTPException(status_code=404, detail="Profile not found")

@router.get("/twin")
async def get_twin_state(current_user = Depends(get_current_user)):
    user_id = current_user.id if hasattr(current_user, 'id') else (current_user.get("sub") or current_user.get("id"))
    profile = store.get_user(user_id)
    
    status = "healthy"
    if profile and hasattr(profile, "twin_status"):
         status = profile.twin_status
    elif profile and isinstance(profile, dict):
         status = profile.get("twin_status", "healthy")

    logger.debug(f"[User API - Twin] Returning status '{status}' for user {user_id}")
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
