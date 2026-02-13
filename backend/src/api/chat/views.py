from fastapi import APIRouter, Depends, WebSocket
from typing import List
from src.api.deps import get_current_user
from .schemas import ChatMessage

router = APIRouter()

@router.post("/message")
async def send_message(message: ChatMessage, current_user: dict = Depends(get_current_user)):
    return {"reply": "Echo: " + message.content}

@router.get("/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    return [{"role": "user", "content": "hi"}, {"role": "ai", "content": "hello"}]

@router.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")
