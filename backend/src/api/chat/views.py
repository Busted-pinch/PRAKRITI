from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from typing import List, Dict
from src.api.deps import get_current_user, get_supabase_client
from .schemas import ChatMessage
import asyncio
import json

router = APIRouter()


# ---------------------------
# Connection Manager
# ---------------------------

class ConnectionManager:
    def __init__(self):
        # Multi-tab support
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()

        if user_id not in self.active_connections:
            self.active_connections[user_id] = []

        self.active_connections[user_id].append(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)

            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_json(self, data: dict, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(data)
                except:
                    pass


manager = ConnectionManager()


# ---------------------------
# HTTP Endpoints
# ---------------------------

@router.post("/message")
async def send_message(
    message: ChatMessage,
    current_user: dict = Depends(get_current_user)
):
    return {"reply": "Echo: " + message.content}


@router.get("/history", response_model=List[ChatMessage])
async def get_chat_history(
    current_user: dict = Depends(get_current_user)
):
    return [
        ChatMessage(role="user", content="hi"),
        ChatMessage(role="ai", content="hello"),
    ]


# ---------------------------
# AI Streaming Stub
# Replace this with LangGraph stream
# ---------------------------

async def stream_ai_response(prompt: str):
    """
    Replace this function with LangGraph streaming logic.
    This is currently a stub for token-wise streaming.
    """

    fake_response = f"Echo: {prompt}"

    for char in fake_response:
        await asyncio.sleep(0.03)  # simulate token delay
        yield char


# ---------------------------
# WebSocket Endpoint
# ---------------------------

@router.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):

    # Extract token (browser compatible)
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008)
        return

    supabase = get_supabase_client()

    try:
        user = supabase.auth.get_user(token)

        if not user or not user.user:
            await websocket.close(code=1008)
            return

        user_id = user.user.id

    except Exception:
        await websocket.close(code=1008)
        return

    # Accept connection
    await manager.connect(user_id, websocket)

    try:
        while True:
            try:
                # Idle timeout (10 minutes)
                data = await asyncio.wait_for(
                    websocket.receive_json(),
                    timeout=600
                )

            except asyncio.TimeoutError:
                await websocket.close(code=1000)
                break

            except WebSocketDisconnect:
                break

            # Expecting JSON input like:
            # { "type": "message", "content": "Hello" }

            if data.get("type") != "message":
                continue

            prompt = data.get("content", "")

            # Notify frontend streaming started
            await manager.send_json(
                {"type": "start"},
                user_id
            )

            try:
                # Stream AI tokens
                async for token in stream_ai_response(prompt):
                    await manager.send_json(
                        {
                            "type": "token",
                            "content": token
                        },
                        user_id
                    )

                # Streaming complete
                await manager.send_json(
                    {"type": "done"},
                    user_id
                )

            except Exception as e:
                await manager.send_json(
                    {
                        "type": "error",
                        "message": str(e)
                    },
                    user_id
                )

    finally:
        manager.disconnect(user_id, websocket)
