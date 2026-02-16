from fastapi import APIRouter
from src.core.supabase_client import supabase

router = APIRouter()

@router.post("/collect")
async def collect_behavior(
    session_id: str,
    outdoor_minutes: int,
    activity_level: str,
    mask_usage: bool,
    transport_mode: str
):
    data = {
        "session_id": session_id,
        "outdoor_minutes": outdoor_minutes,
        "activity_level": activity_level,
        "mask_usage": mask_usage,
        "transport_mode": transport_mode
    }

    supabase.table("behavior_data").insert(data).execute()

    return {"status": "stored", "data": data}
