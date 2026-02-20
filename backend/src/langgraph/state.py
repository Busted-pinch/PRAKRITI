from typing import TypedDict, Annotated, List, Dict, Any, Optional
from langchain_core.messages import BaseMessage
import operator


def merge_dicts(a: Dict[str, Any], b: Dict[str, Any]) -> Dict[str, Any]:
    return {**a, **b}


class UnifiedState(TypedDict):

    messages: Annotated[List[BaseMessage], operator.add]
    next_agent: Optional[str]

    structured_data: Annotated[Dict[str, Any], merge_dicts]

    user_id: Optional[str]
    lat: Optional[float]
    lon: Optional[float]

    error: Optional[str]
    final_response: Optional[str]