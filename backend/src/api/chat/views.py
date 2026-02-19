from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
from src.api.deps import get_current_user
from .schemas import ChatMessage
import asyncio
import json

router = APIRouter()

# ---------------------------
# Mock Connection Manager
# ---------------------------

class ConnectionManager:
    def __init__(self):
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
# HTTP Endpoints (MOCKED)
# ---------------------------

@router.post("/message")
async def send_message(message: ChatMessage):
    """
    Mocked Chat Endpoint to bypass LangChain/Pydantic issues on Python 3.14.
    """
    user_msg = message.message.lower()
    
    # Simple keyword-based logic for demo
    if "aqi" in user_msg and "300" in user_msg:
        reply = "If the AQI reaches 300 (Severe), I recommend avoiding all outdoor physical activity. Indoor air purification is advised."
    elif "monitor" in user_msg or "track" in user_msg:
        reply = "I am tracking environmental metrics in real-time. Your local monitors are active."
    elif "simulation" in user_msg or "what if" in user_msg:
        reply = "I can run simulations for you. Try asking 'What if temperature rises by 2 degrees?'"
    else:
        reply = "I am Prakriti's Digital Twin. I can help you analyze environmental data and simulate future scenarios."

    return {
        "reply": reply,
        "structured_data": {},
        "agent_trace": "mock_agent"
    }

@router.get("/history")
async def get_chat_history():
    return [{"role": "system", "content": "History not available in mock mode."}]

@router.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            
            # Simulate streaming delay
            await asyncio.sleep(0.5)
            
            await websocket.send_json({
                "type": "update",
                "node": "agent",
                "content": "Processing your request...",
                "structured_data": {}
            })
            
            await asyncio.sleep(1)
            
            await websocket.send_json({
                "type": "update",
                "node": "agent",
                "content": "I am operating in Mock Mode due to system constraints, but I am fully functional for this demo.",
                "structured_data": {}
            })
            
            await websocket.send_json({"type": "complete"})
            
    except WebSocketDisconnect:
        print("Client disconnected")
