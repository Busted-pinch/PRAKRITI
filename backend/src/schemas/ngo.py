from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class NGOEventBase(BaseModel):
    ngo_name: str
    event_title: str
    description: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[datetime] = None
    source_url: Optional[str] = None

class NGOEventResponse(NGOEventBase):
    id: str
    similarity: Optional[float] = None

class NGORecommendationResponse(BaseModel):
    events: List[NGOEventResponse]
    source: str = "database" # Indicates if it came from DB match or fresh Tavily fetch
