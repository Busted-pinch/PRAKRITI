from fastapi import APIRouter, Depends
from src.api.deps import get_current_user, get_supabase_client
from src.services.behavior import (
    derive_behavior_model,
    derive_mbti,
    QuestionnaireResponse,
    BehavioralModel
)

router = APIRouter(
    prefix="/behavior",
    tags=["Behavior"]
)


@router.post("/derive")
async def derive_user_behavior(
    data: QuestionnaireResponse,
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase_client()

    behavior_model: BehavioralModel = derive_behavior_model(data)
    mbti = derive_mbti(behavior_model)

    user_id = current_user.id

    # Upsert profile (insert or update)
    supabase.table("behavior_profiles").upsert({
        "user_id": user_id,
        "behavior_model": behavior_model.model_dump(),
        "mbti": mbti,
        "selected_interests": data.selected_interests,
        "hobbies": data.hobbies,
        "diseases": data.diseases,
        "constraints": data.constraints.model_dump()
    }).execute()

    return {
        "behavior_model": behavior_model,
        "mbti": mbti
    }

@router.get("/me")
async def get_my_behavior(
    current_user: dict = Depends(get_current_user)
):
    supabase = get_supabase_client()

    user_id = current_user.id

    response = supabase.table("behavior_profiles") \
        .select("*") \
        .eq("user_id", user_id) \
        .single() \
        .execute()

    return response.data
