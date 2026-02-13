from pydantic import BaseModel
from typing import Optional

class SimulationRequest(BaseModel):
    action: str
    duration_minutes: int
    location: str
    time: str

class SimulationResult(BaseModel):
    simulation_id: str
    exposure_change: float
    risk_delta: float
    carbon_saved: float
    confidence: float
    explanation: str
