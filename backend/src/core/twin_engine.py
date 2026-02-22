import math
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from statistics import mean
from src.core.supabase_client import supabase


def sigmoid(x: float) -> float:
    return 1 / (1 + math.exp(-x))


def normalize(value: Optional[float], scale: float) -> float:
    if value is None:
        return 0.0
    return min(value / scale, 2.0)


class TwinEngine:

    # --------------------------------------------------
    # ENVIRONMENT SCORE
    # --------------------------------------------------

    def compute_environment_score(self, env: Dict[str, Any]) -> float:

        pm25 = normalize(env.get("pm2_5"), 50)
        pm10 = normalize(env.get("pm10"), 80)
        ozone = normalize(env.get("ozone"), 120)
        no2 = normalize(env.get("nitrogen_dioxide"), 100)
        uv = normalize(env.get("uv_index"), 10)

        temp_dev = abs((env.get("temperature") or 25) - 25)
        temp = normalize(temp_dev, 15)

        return (
            0.35 * pm25 +
            0.20 * pm10 +
            0.15 * ozone +
            0.10 * no2 +
            0.10 * uv +
            0.10 * temp
        )

    # --------------------------------------------------
    # ACTIVITY EXPOSURE FACTOR
    # --------------------------------------------------

    def compute_activity_modifier(self, user_id: str) -> float:

        since = (datetime.utcnow() - timedelta(days=1)).isoformat()

        response = supabase.table("user_activity_logs") \
            .select("*") \
            .eq("user_id", user_id) \
            .gte("recorded_at", since) \
            .execute()

        logs = response.data or []

        if not logs:
            return 0.0

        total_minutes = sum(l["outdoor_minutes"] for l in logs)
        avg_minutes = total_minutes / len(logs)

        intensity_map = {
            "low": 0.1,
            "moderate": 0.25,
            "high": 0.4
        }

        avg_intensity = mean([
            intensity_map.get(l["activity_intensity"], 0.2)
            for l in logs
        ])

        return normalize(avg_minutes, 120) * avg_intensity

    # --------------------------------------------------
    # HEALTH MULTIPLIER
    # --------------------------------------------------

    def compute_health_multiplier(self, health: Dict[str, Any]) -> float:

        sensitivity = health.get("health_sensitivity", 1.0)
        diseases = health.get("diseases", [])

        disease_factor = min(len(diseases) * 0.15, 0.6)

        return 1 + sensitivity + disease_factor

    # --------------------------------------------------
    # TREND SLOPE (7 DAY RISK HISTORY)
    # --------------------------------------------------

    def compute_trend_slope(self, user_id: str) -> float:

        since = (datetime.utcnow() - timedelta(days=7)).isoformat()

        response = supabase.table("digital_twin_state") \
            .select("current_risk, updated_at") \
            .eq("user_id", user_id) \
            .gte("updated_at", since) \
            .order("updated_at") \
            .execute()

        records = response.data or []

        if len(records) < 2:
            return 0.0

        first = records[0]["current_risk"]
        last = records[-1]["current_risk"]

        return round((last - first) / len(records), 3)

    # --------------------------------------------------
    # MITIGATION PLAN
    # --------------------------------------------------

    def build_mitigation_plan(self, risk: float, env: Dict[str, Any]) -> Dict[str, Any]:

        plan = []

        if risk > 66:
            plan.append("Limit outdoor exposure to under 30 minutes")
            plan.append("Use N95 mask if outside")

        if env.get("pm2_5") and env["pm2_5"] > 75:
            plan.append("Avoid intense outdoor exercise")

        if env.get("uv_index") and env["uv_index"] > 8:
            plan.append("Use sun protection and hydration")

        return {"actions": plan}

    # --------------------------------------------------
    # PRIMARY RISK DRIVER
    # --------------------------------------------------

    def detect_primary_risk_driver(self, env: Dict[str, Any]) -> str:

        pollutants = {
            "pm2_5": env.get("pm2_5", 0),
            "pm10": env.get("pm10", 0),
            "ozone": env.get("ozone", 0),
            "nitrogen_dioxide": env.get("nitrogen_dioxide", 0),
            "uv_index": env.get("uv_index", 0),
        }

        primary = max(pollutants, key=lambda k: pollutants[k] or 0)
        return primary
    
    # --------------------------------------------------
    # BEHAVIOR-ENV CONFLICT
    # --------------------------------------------------

    def detect_conflict(self, behavior: Dict[str, Any], env: Dict[str, Any]) -> Dict[str, Any]:

        outdoor = behavior.get("outdoor_affinity", 0.5)
        pm25 = env.get("pm2_5") or 0

        conflict = False
        reason = None

        if outdoor > 0.7 and pm25 > 75:
            conflict = True
            reason = "High outdoor tendency during heavy pollution"

        return {
            "conflict": conflict,
            "reason": reason
        }
    # --------------------------------------------------
    # FINAL RISK
    # --------------------------------------------------

    def compute_final_risk(
        self,
        env_score: float,
        activity_modifier: float,
        health_multiplier: float
    ) -> float:

        raw = (env_score * health_multiplier) + activity_modifier
        return round(sigmoid(raw) * 100, 2)

    # --------------------------------------------------
    # PROJECTION
    # --------------------------------------------------

    def project_7_days(self, current_risk: float, trend_slope: float):

        projection = []

        for day in range(1, 8):
            projected = current_risk + (trend_slope * day)
            projected = max(0, min(projected, 100))
            projection.append(round(projected, 2))

        return projection

    # --------------------------------------------------
    # BUILD FULL TWIN
    # --------------------------------------------------

    def build_twin_state(
        self,
        user_id: str,
        environment: Dict[str, Any],
        behavior_profile: Dict[str, Any]
    ) -> Dict[str, Any]:

        health = behavior_profile.get("health_profile", {})

        env_score = self.compute_environment_score(environment)
        activity_modifier = self.compute_activity_modifier(user_id)
        health_multiplier = self.compute_health_multiplier(health)
        primary_driver = self.detect_primary_risk_driver(environment)
        conflict = self.detect_conflict(
            behavior_profile.get("behavior_model", {}),
            environment
)

        risk = self.compute_final_risk(
            env_score,
            activity_modifier,
            health_multiplier
        )

        trend_slope = self.compute_trend_slope(user_id)

        projection = self.project_7_days(risk, trend_slope)

        mitigation = self.build_mitigation_plan(risk, environment)

        twin_state = {
            "current_risk": risk,
            "risk_category": "low" if risk < 33 else "moderate" if risk < 66 else "high",
            "risk_components": {
                "primary_risk_driver": primary_driver,
                "behavior_environment_conflict": conflict
            },
            "trend_slope": trend_slope,
            "projection_7d": projection,
            "mitigation_plan": mitigation,
            "last_activity": {
                "activity_modifier": activity_modifier
            },
            "updated_at": datetime.utcnow().isoformat()
        }

        supabase.table("digital_twin_state").upsert({
            "user_id": user_id,
            **twin_state
        }).execute()

        return twin_state