from typing import Optional
import requests

from src.core.supabase_client import supabase
from src.schemas.aggregate import EnvironmentData, SessionData, UserData
from src.api.environment.services import fetch_environment_from_api


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

    def create_user(self, user_data: dict) -> Optional[UserData]:
        """Creates a new user in the database."""
        res = supabase.table("users").insert(user_data).execute()
        if res.data:
            return UserData(**res.data[0])
        return None

    def update_user(self, user_id: str, updates: dict) -> Optional[UserData]:
        """Updates an existing user in the database."""
        res = supabase.table("users").update(updates).eq("id", user_id).execute()
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

        # 4️⃣ Fallback to external API service
        try:
            api_env = fetch_environment_from_api(lat, lon)
            api_env.session_id = session_id
            
            # Store the fetched data
            self.store_environment(api_env)
            
            return api_env

        except Exception:
            return None


    # ---------- CACHE PLACEHOLDER ----------
    def get_cached_environment(self, session_id: str):
        return None
