from pydantic import BaseModel
from typing import Optional

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    sensitivity: Optional[str] = None
    risk_tolerance: Optional[float] = None

class TwinUpdate(BaseModel):
    health_status: str
    avatar_state: str

class SettingsUpdate(BaseModel):
    notifications: bool
    theme: str
