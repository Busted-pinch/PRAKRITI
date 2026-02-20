from typing import TypedDict, Annotated, List, Dict, Any, Optional
from langchain_core.messages import BaseMessage
import operator

def merge_dicts(a: Dict[str, Any], b: Dict[str, Any]) -> Dict[str, Any]:
    """Helper to merge dictionaries."""
    return {**a, **b}

class UnifiedState(TypedDict):
    """
    Unified state for the LangGraph agent system.

    Attributes:
        messages: The conversation history.
        next_agent: The name of the next agent to execute (set by Supervisor).
        structured_data: A dictionary to pass non-text data between agents.
        user_id: The ID of the user interacting with the system.
        error: Track any errors that occur during execution.
        final_response: The final text response to send back to the user (if separate from messages).
    """
    messages: Annotated[List[BaseMessage], operator.add]
    next_agent: Optional[str]
    structured_data: Annotated[Dict[str, Any], merge_dicts]
    user_id: Optional[str]
    lat: Optional[float]
    lon: Optional[float]
    error: Optional[str]
    final_response: Optional[str]
