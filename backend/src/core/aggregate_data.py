from typing import Dict, Any, Optional
import asyncio
from src.core.cache import get_cache, set_cache
from src.core.supabase_client import supabase
from src.schemas.aggregate import EnvironmentData, SessionData, UserData
from src.api.environment.services import fetch_environment_from_api
from src.core.twin_engine import TwinEngine
from src.core.open_meteo_client import fetch_weather, fetch_air_quality
from src.core.waqi_client import fetch_waqi

class AggregateData:
    """
    Central datastore for Supabase access, external APIs, and caching.
    """

    # ---------- USER ----------
    def get_user(self, user_id: str) -> Optional[UserData]:
        res = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        if res.data:
            return UserData(**res.data)
        return None

    def create_user(self, user_data: dict) -> Optional[UserData]:
        """Creates a new user in the database."""
        res = supabase.table("profiles").insert(user_data).execute()
        if res.data:
            return UserData(**res.data[0])
        return None

    def update_user(self, user_id: str, updates: dict) -> Optional[UserData]:
        """Updates an existing user in the database."""
        res = supabase.table("profiles").update(updates).eq("id", user_id).execute()
        if res.data:
            return UserData(**res.data[0])
        return None

    # ---------- SESSION ----------
    def get_session(self, session_id: str) -> Optional[SessionData]:
        res = (
            supabase.table("user_sessions")
            .select("*")
            .eq("session_id", session_id)
            .single()
            .execute()
        )
        if res.data:
            return SessionData(**res.data)
        return None
    
    # ---------- WEATHER DATA ----------
    async def get_weather_data(self, location: str):
        """
        Fetch latest weather snapshot from environmental_readings.
        """
        res = (
            supabase
            .table("environmental_readings")
            .select("data_type, readings")
            .eq("is_forecast", False)
            .order("recorded_at", desc=True)
            .limit(50)
            .execute()
        )

        weather = {}

        for row in res.data or []:
            param = row.get("data_type")
            value = row.get("readings", {}).get("value")

            if value is None:
                continue

            if param == "temperature_2m" and "temperature" not in weather:
                weather["temperature"] = value
            elif param == "relative_humidity_2m" and "humidity" not in weather:
                weather["humidity"] = value
            elif param == "wind_speed_10m" and "wind_speed" not in weather:
                weather["wind_speed"] = value
            elif param == "uv_index" and "uv_index" not in weather:
                weather["uv_index"] = value

        return weather
    
    # ---------- CLIMATE INFO ----------
    async def get_climate_info(self, location: str):
        """
        Return simple derived climate stats.
        """
        res = (
            supabase
            .table("environmental_readings")
            .select("readings")
            .eq("data_type", "pm2_5")
            .eq("is_forecast", False)
            .limit(100)
            .execute()
        )

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

    def get_raw_behavior_profile(self, user_id: str):
        res = supabase.table("behavior_profiles").select("*").eq("user_id", user_id).limit(1).execute()
        return res.data[0] if res.data else None

    def upsert_behavior_profile(self, user_id: str, data: dict):
        # We must include user_id in the data for upsert
        upsert_data = {"user_id": user_id, **data}
        res = supabase.table("behavior_profiles").upsert(upsert_data, on_conflict="user_id").execute()
        return res.data[0] if res.data else None

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