from fastapi import APIRouter, Depends
from typing import Optional
from datetime import datetime
from src.api.deps import get_current_user
from src.core.supabase_client import supabase
from src.api.environment.utils import (
    parse_hourly,
    map_weather_code,
    map_aqi_category,
    build_waqi_record
)
from src.core.waqi_client import fetch_waqi
from src.core.open_meteo_client import fetch_weather, fetch_air_quality
import asyncio
from src.core.aggregate_data import AggregateData

router = APIRouter(dependencies=[Depends(get_current_user)])

store = AggregateData()

# ---------------------------------------
# CURRENT ENVIRONMENT
# ---------------------------------------

@router.get("/current")
async def get_current_environment(lat: float, lon: float):

    weather, air, waqi_data = await asyncio.gather(
        fetch_weather(lat, lon),
        fetch_air_quality(lat, lon),
        fetch_waqi(lat, lon)
    )

    current_weather = weather.get("current", {})
    hourly_air = air.get("hourly", {})

    weather_code = current_weather.get("weathercode")
    weather_condition = map_weather_code(weather_code)

    aqi_value = None
    dominant = None
    station_name = None
    aqi_time = None

    if waqi_data and isinstance(waqi_data, dict):
        aqi_value = waqi_data.get("aqi")
        dominant = waqi_data.get("dominentpol")
        station_name = waqi_data.get("city", {}).get("name")
        aqi_time = waqi_data.get("time", {}).get("s")

    aqi_category = map_aqi_category(aqi_value)
    waqi_record = build_waqi_record(lat, lon, waqi_data)

    if waqi_record:
        supabase.table("environmental_readings") \
            .upsert(
                waqi_record,
                on_conflict="data_type,recorded_at,source"
            ) \
            .execute()

    return {
        "temperature": current_weather.get("temperature_2m"),
        "apparent_temperature": current_weather.get("apparent_temperature"),
        "humidity": current_weather.get("relative_humidity_2m"),
        "wind_speed": current_weather.get("wind_speed_10m"),
        "uv_index": current_weather.get("uv_index"),

        "weather_code": weather_code,
        "weather_condition": weather_condition,

        "pm2_5": hourly_air.get("pm2_5", [None])[0],
        "pm10": hourly_air.get("pm10", [None])[0],
        "ozone": hourly_air.get("ozone", [None])[0],
        "nitrogen_dioxide": hourly_air.get("nitrogen_dioxide", [None])[0],

        "aqi": aqi_value,
        "aqi_category": aqi_category,
        "dominant_pollutant": dominant,
        "aqi_station": station_name,
        "aqi_timestamp": aqi_time,
    }

# ---------------------------------------
# HOURLY FORECAST
# ---------------------------------------

@router.get("/hourly")
async def get_hourly_forecast(lat: float, lon: float):

    weather = await fetch_weather(lat, lon)
    hourly = weather.get("hourly", {})
    time = hourly.get("time", [])

    result = []

    for i, timestamp in enumerate(time):
        result.append({
            "time": timestamp,
            "temperature": hourly.get("temperature_2m", [None])[i] if i < len(hourly.get("temperature_2m", [])) else None,
            "humidity": hourly.get("relative_humidity_2m", [None])[i] if i < len(hourly.get("relative_humidity_2m", [])) else None,
            "wind_speed": hourly.get("wind_speed_10m", [None])[i] if i < len(hourly.get("wind_speed_10m", [])) else None,
            "precipitation": hourly.get("precipitation", [None])[i] if i < len(hourly.get("precipitation", [])) else None,
            "uv_index": hourly.get("uv_index", [None])[i] if i < len(hourly.get("uv_index", [])) else None,
        })

    return result

# ---------------------------------------
# TREND FROM DATABASE (JSON FIXED)
# ---------------------------------------

@router.get("/trend")
async def get_environment_trend(days: int = 7):

    response = supabase.table("environmental_readings") \
        .select("readings") \
        .eq("data_type", "pm2_5") \
        .eq("is_forecast", False) \
        .execute()

    values = []

    for row in response.data:
        val = row["readings"].get("value")
        if val is not None:
            values.append(float(val))

    avg = sum(values) / len(values) if values else 0

    return {
        "avg_pm2_5": avg,
        "trend": "improving" if avg < 50 else "worsening"
    }

# ---------------------------------------
# EXPOSURE (JSON FIXED)
# ---------------------------------------

@router.get("/exposure")
async def get_exposure_history(start: str, end: str):

    response = supabase.table("environmental_readings") \
        .select("readings") \
        .eq("data_type", "pm2_5") \
        .gte("recorded_at", start) \
        .lte("recorded_at", end) \
        .eq("is_forecast", False) \
        .execute()

    values = []

    for row in response.data:
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

    # Chunk insert to avoid Supabase overload
    def chunk(data, size=500):
        for i in range(0, len(data), size):
            yield data[i:i + size]

    for batch in chunk(all_rows):
        supabase.table("environmental_readings").insert(batch).execute()

    return {
        "status": "stored",
        "records_inserted": len(all_rows)
    }
