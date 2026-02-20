from pydantic import BaseModel
from typing import Optional


# -----------------------------------
# USER DATA
# -----------------------------------

class UserData(BaseModel):
    id: str
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    health_conditions: Optional[str] = None
    home_location: Optional[str] = None


# -----------------------------------
# SESSION DATA
# -----------------------------------

class SessionData(BaseModel):
    session_id: str
    user_id: str
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None


# -----------------------------------
# ENVIRONMENT DATA (UPDATED)
# -----------------------------------

class EnvironmentData(BaseModel):
    session_id: str

    # Weather
    temperature: Optional[float] = None
    apparent_temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    uv_index: Optional[float] = None
    precipitation: Optional[float] = None
    visibility: Optional[float] = None

    # Air Quality
    pm2_5: Optional[float] = None
    pm10: Optional[float] = None
    ozone: Optional[float] = None
    nitrogen_dioxide: Optional[float] = None
    carbon_monoxide: Optional[float] = None

    # Forecast flag
    is_forecast: Optional[bool] = False
