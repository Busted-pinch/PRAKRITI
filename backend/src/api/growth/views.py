from fastapi import APIRouter, Depends
from src.api.deps import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/achievements")
async def get_achievements():
    return [{"id": "1", "name": "First Step", "unlocked": True}]

@router.get("/badges")
async def get_badges():
    return [{"id": "badge_1", "icon": "🌿"}]

@router.get("/progress")
async def get_progress():
    return {"level": 5, "xp": 1200}

@router.post("/evaluate")
async def evaluate_progress():
    return {"new_badges": []}

@router.get("/microlearning/recommend")
async def recommend_content():
    return {"content_id": "123", "title": "Understanding PM2.5"}

@router.post("/microlearning/complete")
async def complete_content():
    return {"xp_gained": 50}
