from pydantic import BaseModel
from typing import Optional

class SimulationRequest(BaseModel):
    scenario: Optional[str] = None
    parameters: Optional[dict] = None
    action: Optional[str] = None
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    time: Optional[str] = None

class SimulationResult(BaseModel):
    simulation_id: str
    exposure_change: float
    risk_delta: float
    carbon_saved: float
    confidence: float
    explanation: str
