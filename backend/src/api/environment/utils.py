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
    "pm2_5": "µg/m³",
    "pm10": "µg/m³",
    "carbon_monoxide": "µg/m³",
    "nitrogen_dioxide": "µg/m³",
    "sulphur_dioxide": "µg/m³",
    "ozone": "µg/m³",
    "aerosol_optical_depth": "index",
}


def parse_hourly(data: dict, lat: float, lon: float, source: str, is_forecast=True):
    hourly = data.get("hourly", {})
    times = hourly.get("time", [])

    records = []

    for i, timestamp in enumerate(times):
        for param, values in hourly.items():
            if param == "time":
                continue

            # Ensure only known parameters are stored
            if param not in UNIT_MAP:
                continue

            value = values[i] if i < len(values) else None

            # Skip null values
            if value is None:
                continue

            records.append({
                "location": {
                    "lat": lat,
                    "long": lon,
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
