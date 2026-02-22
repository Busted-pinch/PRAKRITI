"""
map_routes.py — PRAKRITI Map API

All map endpoints now use the same AggregateData.get_environment_snapshot()
pipeline as the Dashboard, ensuring full data parity.

Endpoints:
  GET /map/env-grid        → 5×5 Pune grid, returns [{lat, lng, aqi, ...}]
  GET /map/env-snapshot    → Single-point full snapshot for the location card
  GET /personal-risk       → Personal-mode heat points (risk-scaled aqi)
"""

import asyncio
import math
import os
import httpx
from fastapi import APIRouter
from src.core.aggregate_data import AggregateData

router = APIRouter()

# ─── Pune bounding box ───────────────────────────────────────────────────────
LAT_MIN, LAT_MAX = 18.40, 18.75
LNG_MIN, LNG_MAX = 73.65, 74.05

# Shared datastore — same instance used by the environment router
_datastore = AggregateData()


# ─── helpers ─────────────────────────────────────────────────────────────────

def _pune_grid(rows: int = 5, cols: int = 5) -> list[tuple[float, float]]:
    """Generate a (rows × cols) lat/lng grid across the Pune bounding box."""
    lats = [LAT_MIN + (LAT_MAX - LAT_MIN) * i / (rows - 1) for i in range(rows)]
    lngs = [LNG_MIN + (LNG_MAX - LNG_MIN) * j / (cols - 1) for j in range(cols)]
    return [(lat, lng) for lat in lats for lng in lngs]


def _safe(val):
    """Replace NaN/inf with None so JSON serialization never crashes."""
    if val is None:
        return None
    try:
        f = float(val)
        return None if (math.isnan(f) or math.isinf(f)) else f
    except (TypeError, ValueError):
        return None


async def _snapshot(lat: float, lng: float) -> dict:
    """Fetch environment snapshot for a single point, returning safe defaults."""
    try:
        data = await _datastore.get_environment_snapshot(lat, lng)
        if not data:
            return None
        return {
            "lat": lat,
            "lng": lng,
            "aqi":              _safe(data.get("aqi")),
            "temperature":      _safe(data.get("temperature")),
            "humidity":         _safe(data.get("humidity")),
            "wind_speed":       _safe(data.get("wind_speed")),
            "uv_index":         _safe(data.get("uv_index")),
            "pm2_5":            _safe(data.get("pm2_5")),
            "pm10":             _safe(data.get("pm10")),
            "ozone":            _safe(data.get("ozone")),
            "nitrogen_dioxide": _safe(data.get("nitrogen_dioxide")),
        }
    except Exception:
        return None


# ─── /map/aqi-stations ─────────────────────────────────────────────────────
# Returns REAL WAQI monitoring station positions for Pune (irregular, not a grid).
# This gives the authentic uneven hotspot distribution shown on AQI.in.

@router.get("/map/aqi-stations")
async def aqi_stations():
    token = os.getenv("WAQI_TOKEN", "")
    url = (
        f"https://api.waqi.info/map/bounds/"
        f"?token={token}&latlng=18.20,73.50,18.90,74.20"  # wider Pune region
    )

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(url)
            data = res.json()
    except Exception:
        return []

    points = []
    if data.get("status") == "ok":
        for s in data.get("data", []):
            aqi = s.get("aqi")
            lat = s.get("lat")
            lng = s.get("lon")
            if aqi in (None, "-") or lat is None or lng is None:
                continue
            try:
                points.append({
                    "lat": float(lat),
                    "lng": float(lng),
                    "aqi": float(aqi),
                })
            except (ValueError, TypeError):
                continue

    return points


# ─── /map/env-grid ───────────────────────────────────────────────────────────

@router.get("/map/env-grid")
async def env_grid():
    """
    Returns a 5×5 grid of environment snapshots across Pune.
    Used by the heat layer + station markers on the map.
    Points with no AQI data are filtered out.
    """
    grid = _pune_grid(5, 5)

    # Fetch all 25 points concurrently (Redis cache hits are near-instant)
    results = await asyncio.gather(*[_snapshot(lat, lng) for lat, lng in grid])

    # Only return points that have a valid AQI
    return [r for r in results if r is not None and r.get("aqi") is not None]


# ─── /map/env-snapshot ───────────────────────────────────────────────────────

@router.get("/map/env-snapshot")
async def env_snapshot(lat: float, lng: float):
    """
    Returns a full environment snapshot for a single location.
    Used by the map location info card on moveend.
    """
    data = await _snapshot(lat, lng)
    if not data:
        return {"aqi": None, "temperature": None, "humidity": None,
                "wind_speed": None, "pm2_5": None, "pm10": None,
                "ozone": None, "nitrogen_dioxide": None}
    return data


# ─── /personal-risk ──────────────────────────────────────────────────────────

@router.get("/personal-risk")
async def personal_risk():
    """
    Personal-mode heat points: same grid as env-grid but AQI is risk-scaled
    (humidity + wind adjustment × sensitivity factor).
    Keeps map heat data consistent with dashboard's personal risk model.
    """
    grid = _pune_grid(5, 5)
    results = await asyncio.gather(*[_snapshot(lat, lng) for lat, lng in grid])

    sensitivity = 0.4  # TODO: replace with user profile value when auth added to map

    out = []
    for r in results:
        if r is None or r.get("aqi") is None:
            continue

        aqi = float(r["aqi"])
        humidity = float(r.get("humidity") or 0)
        wind = float(r.get("wind_speed") or 0)

        humidity_factor = 1 + humidity / 200
        wind_factor = max(0.5, 1 - wind / 50)   # clamp so it never goes negative
        adjusted = aqi * humidity_factor * wind_factor
        risk = adjusted * (1 + sensitivity)

        if not math.isfinite(risk):
            risk = aqi

        out.append({
            "lat": r["lat"],
            "lng": r["lng"],
            "aqi": round(risk, 1),
        })

    return out