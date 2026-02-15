from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from typing import List, Dict
from src.api.deps import get_current_user, get_supabase_client
from .schemas import ChatMessage
import asyncio

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        # Allow multiple connections per user (multi-tab support)
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

            # Cleanup if no active sockets left
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_text(message)


manager = ConnectionManager()


# ------------------- HTTP ROUTES -------------------

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


# ------------------- WEBSOCKET ROUTE -------------------

@router.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):

    # Extract token from query params (browser compatible)
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

    # Accept and register connection
    await manager.connect(user_id, websocket)

    try:
        while True:
            try:
                # Idle timeout (10 minutes)
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=600
                )

            except asyncio.TimeoutError:
                await websocket.close(code=1000)
                break

            # Process message
            response = f"Echo: {data}"
            await manager.send_personal_message(response, user_id)

    except WebSocketDisconnect:
        pass

    finally:
        manager.disconnect(user_id, websocket)
