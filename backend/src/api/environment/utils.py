UNIT_MAP = {
    "temperature_2m": "°C",
    "apparent_temperature": "°C",
    "relative_humidity_2m": "%",
    "dew_point_2m": "°C",
    "surface_pressure": "hPa",
    "cloud_cover": "%",
    "wind_speed_10m": "km/h",
    "wind_direction_10m": "°",
    "wind_gusts_10m": "km/h",
    "precipitation": "mm",
    "rain": "mm",
    "showers": "mm",
    "snowfall": "cm",
    "shortwave_radiation": "W/m²",
    "uv_index": "index",
    "visibility": "m",
    "soil_temperature_0cm": "°C",
    "soil_moisture_0_1cm": "m³/m³",
    "evapotranspiration": "mm",
    "runoff": "mm",
    "aqi": "AQI",
    "pm2_5": "µg/m³",
    "pm10": "µg/m³",
    "carbon_monoxide": "µg/m³",
    "nitrogen_dioxide": "µg/m³",
    "sulphur_dioxide": "µg/m³",
    "ozone": "µg/m³",
    "aerosol_optical_depth": "index",
}


# 🔹 Weather Code Mapping
WEATHER_CODE_MAP = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm with hail",
}

def map_aqi_category(aqi):
    if aqi is None:
        return None
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Satisfactory"
    elif aqi <= 200:
        return "Moderate"
    elif aqi <= 300:
        return "Poor"
    elif aqi <= 400:
        return "Very Poor"
    else:
        return "Severe"


def map_weather_code(code: int):
    if code is None:
        return None
    return WEATHER_CODE_MAP.get(code, "Unknown")


def build_waqi_record(lat: float, lon: float, waqi_data: dict):
    if not waqi_data:
        return None

    aqi = waqi_data.get("aqi")
    if aqi is None:
        return None

    station_name = waqi_data.get("city", {}).get("name")
    timestamp = waqi_data.get("time", {}).get("s")

    return {
        "location": {
            "lat": lat,
            "lon": lon,
            "name": station_name or "unknown"
        },
        "data_type": "aqi",
        "readings": {
            "value": aqi,
            "unit": "AQI"
        },
        "source": "waqi",
        "recorded_at": timestamp,
        "is_forecast": False
    }

def parse_hourly(data: dict, lat: float, lon: float, source: str, is_forecast=True):
    hourly = data.get("hourly", {})
    times = hourly.get("time", [])

    records = []

    # 🔥 Pre-filter valid parameters
    valid_params = [p for p in hourly.keys() if p in UNIT_MAP and p != "time"]

    for i, timestamp in enumerate(times):
        for param in valid_params:
            values = hourly.get(param, [])
            value = values[i] if i < len(values) else None

            if value is None:
                continue

            records.append({
                "location": {
                    "lat": lat,
                    "lon": lon,   # ✅ fixed from "long"
                    "name": "auto"
                },
                "data_type": param,
                "readings": {
                    "value": value,
                    "unit": UNIT_MAP[param]
                },
                "source": source,
                "recorded_at": timestamp,
                "is_forecast": is_forecast
            })

    return records