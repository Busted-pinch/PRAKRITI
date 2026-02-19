import httpx

WEATHER_PARAMS = [
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "dew_point_2m",
    "surface_pressure",
    "cloud_cover",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_gusts_10m",
    "precipitation",
    "rain",
    "showers",
    "snowfall",
    "shortwave_radiation",
    "uv_index",
    "visibility",
    "soil_temperature_0cm",
    "soil_moisture_0_1cm",
    "evapotranspiration",
    "runoff",
]

AIR_PARAMS = [
    "pm2_5",
    "pm10",
    "carbon_monoxide",
    "nitrogen_dioxide",
    "sulphur_dioxide",
    "ozone",
    "aerosol_optical_depth",
    "uv_index",
]


async def fetch_weather(lat: float, lon: float):
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&hourly={','.join(WEATHER_PARAMS)}"
        f"&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,uv_index"
        f"&forecast_days=7&timezone=auto"
    )

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


async def fetch_air_quality(lat: float, lon: float):
    url = (
        f"https://air-quality-api.open-meteo.com/v1/air-quality?"
        f"latitude={lat}&longitude={lon}"
        f"&hourly={','.join(AIR_PARAMS)}"
        f"&forecast_days=3&timezone=auto"
    )

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()
