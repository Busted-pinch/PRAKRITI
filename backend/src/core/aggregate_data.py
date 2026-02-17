from typing import Optional
import requests

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

    # ---------- ENVIRONMENT DB ----------
    def get_environment(self, session_id: str) -> Optional[EnvironmentData]:
        res = (
            supabase.table("environment_data")
            .select("*")
            .eq("session_id", session_id)
            .order("timestamp", desc=True)
            .limit(1)
            .execute()
        )

        if res.data:
            return EnvironmentData(**res.data[0])
        return None

    def store_environment(self, env: EnvironmentData):
        supabase.table("environment_data").insert(env.model_dump()).execute()

    # ---------- EXTERNAL API ----------
    def fetch_environment_api(self, lat: float, lon: float) -> EnvironmentData:
        weather = requests.get(
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
        ).json()

        return EnvironmentData(
            session_id="",
            temperature=weather["current_weather"]["temperature"],
            weather=str(weather["current_weather"]["weathercode"]),
        )

    # ---------- SMART FETCH ----------
    def get_or_fetch_environment(
        self, session_id: str, lat: float, lon: float
    ) -> Optional[EnvironmentData]:

        # 1️⃣ ensure session exists
        session = self.get_session(session_id)
        if not session:
            return None

        # 2️⃣ check DB
        existing = self.get_environment(session_id)
        if existing:
            return existing

        # 3️⃣ call external API
        api_env = self.fetch_environment_api(lat, lon)
        api_env.session_id = session_id

        # 4️⃣ store
        self.store_environment(api_env)

        return api_env

    # ---------- CACHE PLACEHOLDER ----------
    def get_cached_environment(self, session_id: str):
        return None
