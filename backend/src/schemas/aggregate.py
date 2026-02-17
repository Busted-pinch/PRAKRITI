from pydantic import BaseModel
from typing import Optional


class UserData(BaseModel):
    id: str
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    health_conditions: Optional[str] = None
    home_location: Optional[str] = None


class SessionData(BaseModel):
    session_id: str
    user_id: str
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None


class EnvironmentData(BaseModel):
    session_id: str
    temperature: Optional[float] = None
    weather: Optional[str] = None
