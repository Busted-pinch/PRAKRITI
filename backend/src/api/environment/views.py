from fastapi import APIRouter, Depends
from src.api.deps import get_current_user
from src.core.aggregate_data import AggregateData

router = APIRouter(dependencies=[Depends(get_current_user)])

datastore = AggregateData()

# ---------------------------------------
# CURRENT ENVIRONMENT (Unified)
# ---------------------------------------

@router.get("/current")
async def get_current_environment(lat: float, lon: float):

    env_data = await datastore.get_or_fetch_environment(
        session_id="rest_api",
        lat=lat,
        lon=lon,
        forecast=False
    )

    if not env_data:
        return {"error": "Unable to fetch environment data"}

    return env_data.model_dump()


# ---------------------------------------
# HOURLY / FORECAST (Unified)
# ---------------------------------------

@router.get("/hourly")
async def get_hourly_forecast(lat: float, lon: float):

    env_data = await datastore.get_or_fetch_environment(
        session_id="rest_api",
        lat=lat,
        lon=lon,
        forecast=True
    )

    if not env_data:
        return {"error": "Unable to fetch forecast"}

    return {
        "forecast_daily_avg": env_data.forecast_daily_avg,
        "forecast_trajectory": env_data.forecast_trajectory
    }


# ---------------------------------------
# TREND (DB Only)
# ---------------------------------------

@router.get("/trend")
async def get_environment_trend(days: int = 7):

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

    return {
        "cumulative_exposure": cumulative,
        "risk_score": cumulative / 100 if cumulative else 0
    }

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

    return {
        "status": "stored",
        "records_inserted": len(all_rows)
    }
