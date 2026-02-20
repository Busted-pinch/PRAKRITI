from typing import Dict, Any
import asyncio
from src.core.cache import get_cache, set_cache
from src.core.supabase_client import supabase
from src.core.open_meteo_client import fetch_weather, fetch_air_quality
from src.core.waqi_client import fetch_waqi
from src.core.twin_engine import TwinEngine


class AggregateData:

    def __init__(self):
        self.twin_engine = TwinEngine()

    # -----------------------------------
    # BEHAVIOR PROFILE
    # -----------------------------------

    async def get_behavior_profile(self, user_id: str):

        cache_key = f"profile:{user_id}"
        cached = await get_cache(cache_key)
        if cached:
            return cached

        loop = asyncio.get_running_loop()

        response = await loop.run_in_executor(
            None,
            lambda: supabase.table("behavior_profiles")
            .select("*")
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not response.data:
            return {}

        data = response.data

        result = {
            "behavior_model": data.get("behavior_model", {}),
            "interest_vector": data.get("behavior_model", {}).get("interest_vector", {}),
            "health_profile": {
                "health_sensitivity": data.get("behavior_model", {}).get("health_sensitivity", 1.0),
                "diseases": data.get("diseases", [])
            }
        }

        await set_cache(cache_key, result, ttl=1800)

        return result

    # -----------------------------------
    # ENVIRONMENT SNAPSHOT
    # -----------------------------------

    async def get_environment_snapshot(self, lat: float, lon: float):

        cache_key = f"env:{round(lat,4)}:{round(lon,4)}"
        cached = await get_cache(cache_key)
        if cached:
            return cached

        weather, air, waqi = await asyncio.gather(
            fetch_weather(lat, lon),
            fetch_air_quality(lat, lon),
            fetch_waqi(lat, lon)
        )

        snapshot = {
            "temperature": weather.get("current", {}).get("temperature_2m"),
            "humidity": weather.get("current", {}).get("relative_humidity_2m"),
            "wind_speed": weather.get("current", {}).get("wind_speed_10m"),
            "uv_index": weather.get("current", {}).get("uv_index"),
            "pm2_5": air.get("hourly", {}).get("pm2_5", [None])[0],
            "pm10": air.get("hourly", {}).get("pm10", [None])[0],
            "ozone": air.get("hourly", {}).get("ozone", [None])[0],
            "nitrogen_dioxide": air.get("hourly", {}).get("nitrogen_dioxide", [None])[0],
            "aqi": waqi.get("aqi") if waqi else None,
        }

        await set_cache(cache_key, snapshot, ttl=1800)

        return snapshot

    # -----------------------------------
    # FULL CONTEXT BUILDER
    # -----------------------------------

    async def build_full_context(self, user_id: str, lat: float, lon: float):

        environment = await self.get_environment_snapshot(lat, lon)
        behavior = await self.get_behavior_profile(user_id)

        twin_state = self.twin_engine.build_twin_state(
            user_id=user_id,
            environment=environment,
            behavior_profile=behavior
        )

        await set_cache(f"twin:{user_id}", twin_state, ttl=900)

        return {
            "environment": environment,
            "behavior_profile": behavior,
            "twin_state": twin_state,
            "llm_context": {
                "risk_level": twin_state["risk_category"],
                "risk_score": twin_state["current_risk"],
                "projection_7d": twin_state["projection_7d"]
            }
        }