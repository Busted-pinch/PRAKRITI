from fastapi import APIRouter, Depends
from .schemas import ProfileUpdate, TwinUpdate, SettingsUpdate
from src.api.deps import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/profile")
async def get_profile():
    return {"name": "Test User", "sensitivity": "high"}

@router.put("/profile")
async def update_profile(data: ProfileUpdate):
    return {"message": "Profile updated", "data": data}

@router.get("/twin")
async def get_twin_state():
    return {"status": "healthy", "risk_level": "low"}

@router.put("/twin")
async def update_twin_state(data: TwinUpdate):
    return {"message": "Twin updated", "data": data}

@router.get("/settings")
async def get_settings():
    return {"notifications": True, "theme": "dark"}

@router.put("/settings")
async def update_settings(data: SettingsUpdate):
    return {"message": "Settings updated", "data": data}
