from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
from src.api.deps import get_current_user, get_supabase_client
from .schemas import ChatMessage
from langchain_core.messages import HumanMessage, AIMessage
from src.langgraph.graph import app
import json
from loguru import logger

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
        logger.info(f"WebSocket: User {user_id} connected. Active connections: {len(self.active_connections.get(user_id))}")

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)

            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
            logger.info(f"WebSocket: User {user_id} disconnected")

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
async def send_message(message: ChatMessage, current_user: dict = Depends(get_current_user)):
    """
    Process a message through the LangGraph agentic system.
    """
    initial_state = {
        "messages": [HumanMessage(content=message.content)],
        "user_id": current_user.get("id"),
        "structured_data": {}
    }
    
    # Run the graph
    config = {"configurable": {"thread_id": str(current_user.get("id", "anonymous"))}}
    result = await app.ainvoke(initial_state, config=config)
    
    # Extract the last message content
    last_message = result["messages"][-1]
    response_content = last_message.content if hasattr(last_message, "content") else str(last_message)
    
    return {
        "reply": response_content,
        "structured_data": result.get("structured_data"),
        "agent_trace": result.get("next_agent") # Debug info
    }

@router.get("/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    # TODO: Fetch from actual history database
    return [{"role": "system", "content": "History not yet connected to DB."}]

@router.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket, token: str = None):
    """
    WebSocket endpoint for real-time chat with the agent.
    Requires 'token' query parameter for authentication.
    """
    # 1. Authenticate
    if not token:
        await websocket.close(code=1008, reason="Missing authentication token")
        return

    supabase = get_supabase_client()
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
             await websocket.close(code=1008, reason="Invalid authentication token")
             return
        user = user_response.user
        user_id = user.id
    except Exception as e:
        logger.error(f"WebSocket Auth Failed: {e}")
        await websocket.close(code=1008, reason="Authentication failed")
        return

    # 2. Accept Connection
    await manager.connect(user_id, websocket)
    
    try:
        while True:
            # 3. Receive Message (Expect JSON)
            try:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                content = message_data.get("content")
                if not content:
                    continue
            except json.JSONDecodeError:
                # Fallback for plain text for testing convenience
                content = data
            
            # 4. Prepare State with Real User Context
            initial_state = {
                "messages": [HumanMessage(content=content)],
                "user_id": user_id,
                "structured_data": {}
            }
            
            # 5. Stream Graph Execution
            config = {"configurable": {"thread_id": str(user_id)}}
            async for event in app.astream(initial_state, config=config):
                for node_name, state_update in event.items():
                    if "messages" in state_update and state_update["messages"]:
                        last_msg = state_update["messages"][-1]
                        response_content = last_msg.content if hasattr(last_msg, "content") else str(last_msg)
                        
                        # Send updates
                        await manager.send_json({
                            "type": "update",
                            "node": node_name,
                            "content": response_content,
                            "structured_data": state_update.get("structured_data")
                        }, user_id)
            
            # 6. Signal Completion
            await manager.send_json({"type": "complete"}, user_id)
            logger.debug(f"WebSocket: Stream complete for {user_id}")
            
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")
        manager.disconnect(user_id, websocket)
        print(f"Client {user_id} disconnected")
    except Exception as e:
        print(f"WebSocket Error: {e}")
        try:
            await manager.send_json({"type": "error", "content": str(e)}, user_id)
        except:
            pass
        manager.disconnect(user_id, websocket)
