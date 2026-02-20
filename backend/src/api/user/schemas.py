from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class Trait(BaseModel):
    subject: str
    A: float
    fullMark: int

class Persona(BaseModel):
    name: str
    desc: str

class Constraints(BaseModel):
    max_physical_intensity: str
    aqi_sensitivity: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    sensitivity: Optional[str] = None
    risk_tolerance: Optional[float] = None
    hobbies: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    diseases: Optional[List[str]] = None
    constraints: Optional[Constraints] = None

class TwinUpdate(BaseModel):
    health_status: str
    avatar_state: str

class SettingsUpdate(BaseModel):
    notifications: bool
    theme: str

class OnboardingPayload(BaseModel):
    answers: List[int]
    diseases: List[str]
    selected_interests: List[str]
    hobbies: List[str]
    constraints: Constraints

class UserProfile(BaseModel):
    id: str
    email: str
    name: str
    persona: Optional[Persona] = None
    traits: Optional[List[Trait]] = None
    hobbies: List[str] = []
    interests: List[str] = []
    diseases: List[str] = []
    constraints: Optional[Constraints] = None
    twin_status: str = "healthy"
