import asyncio
from fastapi import APIRouter, Depends
from src.api.deps import get_current_user
from src.core.aggregate_data import AggregateData
from src.core.open_meteo_client import fetch_weather, fetch_air_quality
from src.api.environment.utils import parse_hourly
from src.core.logger import logger

router = APIRouter(dependencies=[Depends(get_current_user)])

datastore = AggregateData()

# ---------------------------------------
# CURRENT ENVIRONMENT (Unified)
# ---------------------------------------

@router.get("/current")
async def get_current_environment(lat: float, lon: float):
    logger.debug(f"[Environment API - Current] Fetching environment for lat={lat}, lon={lon}")

    env_data = await datastore.get_environment_snapshot(lat, lon)

    if not env_data:
        return {"error": "Unable to fetch environment data"}

    # Include session_id to satisfy Pydantic models or frontend expectations if necessary
    env_data["session_id"] = "rest_api"
    logger.debug(f"[Environment API - Current] Returning snapshot data: {env_data}")
    return env_data


# ---------------------------------------
# HOURLY / FORECAST (Unified)
# ---------------------------------------

@router.get("/hourly")
async def get_hourly_forecast(lat: float, lon: float):
    logger.debug(f"[Environment API - Hourly] Fetching forecast for lat={lat}, lon={lon}")

    weather, air = await asyncio.gather(
        fetch_weather(lat, lon),
        fetch_air_quality(lat, lon)
    )

    if not weather or not air:
        return {"error": "Unable to fetch forecast"}

    forecast_trajectory = []
    if "hourly" in air and "pm2_5" in air["hourly"]:
        pm25_list = air["hourly"].get("pm2_5", [])[:24]
        temp_list = weather.get("hourly", {}).get("temperature_2m", [])[:24]
        time_list = weather.get("hourly", {}).get("time", [])[:24]
        
        for t, pm, temp in zip(time_list, pm25_list, temp_list):
            forecast_trajectory.append({
                "time": t,
                "pm2_5": pm,
                "temperature": temp
            })

    res = {
        "forecast_daily_avg": {},
        "forecast_trajectory": forecast_trajectory
    }
    logger.debug(f"[Environment API - Hourly] Returning forecast with {len(forecast_trajectory)} hours of data")
    return res


# ---------------------------------------
# TREND (DB Only)
# ---------------------------------------

@router.get("/trend")
async def get_environment_trend(days: int = 7):
    logger.debug(f"[Environment API - Trend] Fetching environment trend for past {days} days")

    from src.core.supabase_client import supabase

    response = supabase.table("environmental_readings") \
        .select("readings") \
        .eq("data_type", "pm2_5") \
        .eq("is_forecast", False) \
        .execute()

    values = []

    for row in response.data or []:
        val = row["readings"].get("value")
        if val is not None:
            values.append(float(val))

    avg = sum(values) / len(values) if values else 0

    return {
        "avg_pm2_5": avg,
        "trend": "improving" if avg < 50 else "worsening"
    }


# ---------------------------------------
# EXPOSURE (DB Only)
# ---------------------------------------

@router.get("/exposure")
async def get_exposure_history(start: str, end: str):

    from src.core.supabase_client import supabase

    response = supabase.table("environmental_readings") \
        .select("readings") \
        .eq("data_type", "pm2_5") \
        .gte("recorded_at", start) \
        .lte("recorded_at", end) \
        .eq("is_forecast", False) \
        .execute()

    values = []

    for row in response.data or []:
        val = row["readings"].get("value")
        if val is not None:
            values.append(float(val))

    cumulative = sum(values)

    res = {
        "cumulative_exposure": cumulative,
        "risk_score": cumulative / 100 if cumulative else 0
    }
    logger.debug(f"[Environment API - Exposure] Returning exposure: {res}")
    return res

# ---------------------------------------
# COLLECT AND STORE
# ---------------------------------------

@router.post("/collect")
async def collect_environment(session_id: str, lat: float, lon: float):

    weather, air = await asyncio.gather(
        fetch_weather(lat, lon),
        fetch_air_quality(lat, lon)
    )

    weather_rows = parse_hourly(weather, lat, lon, "open-meteo-weather", True)
    air_rows = parse_hourly(air, lat, lon, "open-meteo-air", True)

    all_rows = weather_rows + air_rows

    def chunk(data, size=500):
        for i in range(0, len(data), size):
            yield data[i:i + size]

    for batch in chunk(all_rows):
        supabase.table("environmental_readings").insert(batch).execute()

    res = {
        "status": "stored",
        "records_inserted": len(all_rows)
    }
    logger.debug(f"[Environment API - Collect] Storage completed: {res}")
    return res
