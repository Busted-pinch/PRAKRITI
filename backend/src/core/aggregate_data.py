from typing import Optional
import requests

from src.core.supabase_client import supabase
from src.schemas.aggregate import EnvironmentData, SessionData, UserData


class Datastore:
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
    def get_or_fetch_environment(
        self,
        session_id: str,
        lat: float,
        lon: float,
        forecast: bool = False
    ) -> Optional[EnvironmentData]:

        # 1️⃣ Ensure session exists
        session = self.get_session(session_id)
        if not session:
            return None

        # 2️⃣ Try fetching from JSON-based environmental_readings
        response = (
            supabase
            .table("environmental_readings")
            .select("data_type, readings")
            .eq("is_forecast", forecast)
            .eq("location->>lat", str(lat))
            .eq("location->>long", str(lon))
            .order("recorded_at", desc=True)
            .limit(100)
            .execute()
        )

        env_dict = {}

        if response.data:
            for row in response.data:
                param = row.get("data_type")
                value = row.get("readings", {}).get("value")

                if value is None:
                    continue

                # Only assign first occurrence (latest due to DESC order)

                if param == "temperature_2m" and "temperature" not in env_dict:
                    env_dict["temperature"] = value

                elif param == "apparent_temperature" and "apparent_temperature" not in env_dict:
                    env_dict["apparent_temperature"] = value

                elif param == "relative_humidity_2m" and "humidity" not in env_dict:
                    env_dict["humidity"] = value

                elif param == "wind_speed_10m" and "wind_speed" not in env_dict:
                    env_dict["wind_speed"] = value

                elif param == "uv_index" and "uv_index" not in env_dict:
                    env_dict["uv_index"] = value

                elif param == "pm2_5" and "pm2_5" not in env_dict:
                    env_dict["pm2_5"] = value

                elif param == "pm10" and "pm10" not in env_dict:
                    env_dict["pm10"] = value

                elif param == "ozone" and "ozone" not in env_dict:
                    env_dict["ozone"] = value

                elif param == "nitrogen_dioxide" and "nitrogen_dioxide" not in env_dict:
                    env_dict["nitrogen_dioxide"] = value

                elif param == "carbon_monoxide" and "carbon_monoxide" not in env_dict:
                    env_dict["carbon_monoxide"] = value

        # 3️⃣ If DB has values → return structured snapshot
        if env_dict:
            return EnvironmentData(
                session_id=session_id,
                **env_dict,
            )
        # 4️⃣ Fallback to direct API (minimal emergency fallback)
        try:
            weather = requests.get(
                f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true",
                timeout=5
            ).json()

            current = weather.get("current_weather", {})

            return EnvironmentData(
                session_id=session_id,
                temperature=current.get("temperature"),
                wind_speed=current.get("windspeed"),
                is_forecast=False
            )

        except Exception:
            return None


    # ---------- CACHE PLACEHOLDER ----------
    def get_cached_environment(self, session_id: str):
        return None
