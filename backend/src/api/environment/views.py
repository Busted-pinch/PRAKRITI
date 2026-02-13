from fastapi import APIRouter, Depends
from typing import Optional
from src.api.deps import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/current")
async def get_current_environment(lat: float, lon: float):
    return {
        "aqi": 42,
        "pm25": 10.5,
        "weather": "Sunny",
        "temp": 25.0
    }

@router.get("/hourly")
async def get_hourly_forecast(lat: float, lon: float, date: Optional[str] = None):
    return [
        {"hour": "10:00", "aqi": 45},
        {"hour": "11:00", "aqi": 48}
    ]

@router.get("/trend")
async def get_environment_trend(days: int = 7):
    return {
        "trend": "improving",
        "avg_aqi": 35
    }

@router.get("/exposure")
async def get_exposure_history(start: str, end: str):
    return {
        "cumulative_exposure": 120,
        "risk_score": 15
    }
