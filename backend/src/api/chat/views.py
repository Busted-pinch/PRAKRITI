from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
from src.api.deps import get_current_user
from .schemas import ChatMessage
from langchain_core.messages import HumanMessage, AIMessage
from src.langgraph.graph import app
import json

router = APIRouter()

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
    result = await app.ainvoke(initial_state)
    
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
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            
            initial_state = {
                "messages": [HumanMessage(content=data)],
                "user_id": "websocket_user", # TODO: Auth
                "structured_data": {}
            }
            
            async for event in app.astream(initial_state):
                for node_name, state_update in event.items():
                    if "messages" in state_update and state_update["messages"]:
                        last_msg = state_update["messages"][-1]
                        content = last_msg.content if hasattr(last_msg, "content") else str(last_msg)
                        
                        # Send updates for each node
                        await websocket.send_json({
                            "type": "update",
                            "node": node_name,
                            "content": content,
                            "structured_data": state_update.get("structured_data")
                        })
            
            # Send final completion marker
            await websocket.send_json({"type": "complete"})
            
    except WebSocketDisconnect:
        print("Client disconnected")
