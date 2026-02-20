from typing import Dict, Any
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage
from src.langgraph.state import UnifiedState
from src.core.aggregate_data import AggregateData
from src.core.open_meteo_client import fetch_weather, fetch_air_quality
from src.core.waqi_client import fetch_waqi
from src.llm.gemini import get_gemini_llm
from loguru import logger
import asyncio


async def environment_agent(state: UnifiedState, datastore: AggregateData) -> Dict[str, Any]:
    """
    Agent responsible for analyzing real environmental data.
    """
    logger.info("Environment Agent: Started analysis")

    lat = state.get("lat")
    lon = state.get("lon")

    if not lat or not lon:
        return {
            "structured_data": {"error": "Location not provided."},
            "messages": [AIMessage(content="Location data is missing.")]
        }

    weather_data, air_data, waqi_data = await asyncio.gather(
        fetch_weather(lat, lon),
        fetch_air_quality(lat, lon),
        fetch_waqi(lat, lon)
    )

    # 🔹 Fetch Weather
    current_weather = weather_data.get("current", {})

    # 🔹 Fetch Air Quality Pollutants (Open-Meteo)
    hourly_air = air_data.get("hourly", {})

    # 🔹 Fetch AQI (WAQI)
    aqi = None
    dominant = None
    station_name = None

    if waqi_data:
        aqi = waqi_data.get("aqi")
        dominant = waqi_data.get("dominentpol")
        station_name = waqi_data.get("city", {}).get("name")

    # 🔹 Extract pollutant snapshot
    pollutants = {
        "pm2_5": hourly_air.get("pm2_5", [None])[0],
        "pm10": hourly_air.get("pm10", [None])[0],
        "ozone": hourly_air.get("ozone", [None])[0],
        "nitrogen_dioxide": hourly_air.get("nitrogen_dioxide", [None])[0],
    }

    weather = {
        "temperature": current_weather.get("temperature_2m"),
        "humidity": current_weather.get("relative_humidity_2m"),
        "wind_speed": current_weather.get("wind_speed_10m"),
    }

    structured = {
        "weather": weather,
        "pollutants": pollutants,
        "aqi": aqi,
        "dominant_pollutant": dominant,
        "station": station_name,
    }

    logger.debug(f"Environment Structured Data: {structured}")

    llm = get_gemini_llm()

    if not llm:
        return {
            "structured_data": {"environment_analysis": structured},
            "messages": [AIMessage(content=f"Current AQI is {aqi}. Weather: {weather}.")]
        }

    system_prompt = (
        "You are an environmental analyst. "
        "Provide a concise health-focused environmental summary."
    )

    human_prompt = (
        f"Location coordinates: {lat}, {lon}\n"
        f"Weather: {weather}\n"
        f"Pollutants: {pollutants}\n"
        f"AQI: {aqi} (Dominant: {dominant})\n\n"
        "Provide:\n"
        "1. A short health/environmental summary\n"
        "2. One practical eco-friendly suggestion"
    )

    try:
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt)
        ])

        return {
            "structured_data": {"environment_analysis": structured},
            "messages": [response]
        }

    except Exception as e:
        logger.error(f"Environment Error: {e}")
        return {
            "structured_data": {"error": str(e)},
            "messages": [AIMessage(content="Error analyzing environment data.")]
        }