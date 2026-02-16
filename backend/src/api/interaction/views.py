from fastapi import APIRouter
from src.core.supabase_client import supabase

router = APIRouter()

@router.post("/log")
async def log_interaction(
    session_id: str,
    type: str,
    content: str
):
    data = {
        "session_id": session_id,
        "type": type,
        "content": content
    }

    supabase.table("interaction_logs").insert(data).execute()

    return {"status": "logged", "data": data}
