from fastapi import APIRouter
import uuid
from src.core.supabase_client import supabase

router = APIRouter()

@router.post("/start")
async def start_session(user_id: str, lat: float, lon: float):
    session_id = str(uuid.uuid4())

    data = {
        "session_id": session_id,
        "user_id": user_id,
        "location_lat": lat,
        "location_lon": lon
    }

    supabase.table("user_sessions").insert(data).execute()

    return {"session_id": session_id}

@router.get("/user/{user_id}")
async def get_user_sessions(user_id: str):
    res = supabase.table("user_sessions").select("*").eq("user_id", user_id).execute()
    return res.data
