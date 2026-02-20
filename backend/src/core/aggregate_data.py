from typing import Optional
import requests
from src.core.cache import get_cache, set_cache
from src.core.supabase_client import supabase
from src.schemas.aggregate import EnvironmentData, SessionData, UserData


class AggregateData:
    """
    Central datastore for Supabase access, external APIs, and caching.
    """

    # ---------- USER ----------
    def get_user(self, user_id: str) -> Optional[UserData]:
        res = supabase.table("users").select("*").eq("id", user_id).single().execute()
        if res.data:
            return UserData(**res.data)
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

        values = [
            float(row["readings"]["value"])
            for row in res.data or []
            if row.get("readings", {}).get("value") is not None
        ]

        avg_pm25 = sum(values) / len(values) if values else None

        return {
            "average_pm2_5": avg_pm25,
            "air_quality_level": (
                "Good" if avg_pm25 and avg_pm25 < 50
                else "Moderate" if avg_pm25 and avg_pm25 < 100
                else "Poor"
            )
        }
    # ---------- USER INFO ----------
    async def get_user_info(self, user_id: str):
        """
        Fetch profile preferences for personalization.
        """
        res = (
            supabase
            .table("profiles")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )

        if not res.data:
            return {}

        return {
            "id": res.data["id"],
            "preferences": res.data.get("preferences", {}),
            "settings": res.data.get("settings", {})
        }

    
    # ---------- USER BEHAVIOR ----------
    def get_user_behavior(self, user_id: str):

        res = (
            supabase
            .table("behavior_profiles")
            .select("*")
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not res.data:
            return None

        from src.services.behavior.models import BehavioralModel

        behavior_model = BehavioralModel(**res.data["behavior_model"])

        return {
            "behavior_model": behavior_model,
            "mbti": res.data.get("mbti"),
            "selected_interests": res.data.get("selected_interests"),
            "hobbies": res.data.get("hobbies"),
            "diseases": res.data.get("diseases"),
            "constraints": res.data.get("constraints"),
        }


    # ---------- UNIFIED SMART FETCH ----------

    async def get_or_fetch_environment(
        self,
        session_id: str,
        lat: float,
        lon: float,
        forecast: bool = False
    ) -> Optional[EnvironmentData]:

        cache_key = f"env:{lat}:{lon}:{forecast}"

        # 1️⃣ Redis first
        cached = await get_cache(cache_key)
        if cached:
            return EnvironmentData(**cached)

        # 2️⃣ Database fallback
        response = (
            supabase
            .table("environmental_readings")
            .select("data_type, readings")
            .eq("is_forecast", forecast)
            .eq("location->>lat", str(lat))
            .eq("location->>lon", str(lon))
            .order("recorded_at", desc=True)
            .limit(100)
            .execute()
        )

        env_dict = {}

        for row in response.data or []:
            param = row.get("data_type")
            value = row.get("readings", {}).get("value")
            if value is None:
                continue

            if param not in env_dict:
                env_dict[param] = value

        if env_dict:
            snapshot = EnvironmentData(session_id=session_id, **env_dict).model_dump()
            await set_cache(cache_key, snapshot)
            return EnvironmentData(**snapshot)

        return None


    # ---------- CACHE PLACEHOLDER ----------
    def get_cached_environment(self, session_id: str):
        return None
