from fastapi import APIRouter, Depends, HTTPException
from .schemas import SimulationRequest, SimulationResult
from src.api.deps import get_current_user
import uuid

router = APIRouter()

@router.post("/run", response_model=SimulationResult)
async def run_simulation(data: SimulationRequest):
    # Simulate processing
    return {
        "simulation_id": str(uuid.uuid4()),
        "exposure_change": -12.4,
        "risk_delta": -0.8,
        "carbon_saved": 0.7,
        "confidence": 0.83,
        "explanation": "Lower AQI window detected"
    }

@router.get("/history")
async def get_simulation_history():
    return [{"id": "1", "action": "cycling", "exposure_change": -5}]

@router.get("/{id}")
async def get_simulation_detail(id: str):
    return {"id": id, "status": "completed", "result": {}}

@router.delete("/{id}")
async def delete_simulation(id: str):
    return {"message": "Simulation deleted"}
