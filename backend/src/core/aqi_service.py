from datetime import datetime, timedelta
from src.core.supabase_client import supabase


# -------------------------------------------------------
# BREAKPOINT TABLES (CPCB NAQI)
# -------------------------------------------------------

PM25_BREAKPOINTS = [
    (0, 30, 0, 50),
    (31, 60, 51, 100),
    (61, 90, 101, 200),
    (91, 120, 201, 300),
    (121, 250, 301, 400),
    (251, 500, 401, 500),
]

PM10_BREAKPOINTS = [
    (0, 50, 0, 50),
    (51, 100, 51, 100),
    (101, 250, 101, 200),
    (251, 350, 201, 300),
    (351, 430, 301, 400),
    (431, 600, 401, 500),
]

NO2_BREAKPOINTS = [
    (0, 40, 0, 50),
    (41, 80, 51, 100),
    (81, 180, 101, 200),
    (181, 280, 201, 300),
    (281, 400, 301, 400),
    (401, 1000, 401, 500),
]

SO2_BREAKPOINTS = [
    (0, 40, 0, 50),
    (41, 80, 51, 100),
    (81, 380, 101, 200),
    (381, 800, 201, 300),
    (801, 1600, 301, 400),
    (1601, 2000, 401, 500),
]

O3_BREAKPOINTS = [
    (0, 50, 0, 50),
    (51, 100, 51, 100),
    (101, 168, 101, 200),
    (169, 208, 201, 300),
    (209, 748, 301, 400),
    (749, 1000, 401, 500),
]

CO_BREAKPOINTS = [
    (0, 1, 0, 50),
    (1.1, 2, 51, 100),
    (2.1, 10, 101, 200),
    (10.1, 17, 201, 300),
    (17.1, 34, 301, 400),
    (34.1, 50, 401, 500),
]


# -------------------------------------------------------
# UTILITY FUNCTIONS
# -------------------------------------------------------

def calculate_sub_index(concentration, breakpoints):
    if concentration is None:
        return None

    for bp_lo, bp_hi, i_lo, i_hi in breakpoints:
        if bp_lo <= concentration <= bp_hi:
            return round(
                ((i_hi - i_lo) / (bp_hi - bp_lo)) *
                (concentration - bp_lo) +
                i_lo
            )

    return None


def get_rolling_average(lat, lon, pollutant, hours):
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(hours=hours)

    response = (
        supabase.table("environmental_readings")
        .select("readings, recorded_at, location")
        .eq("data_type", pollutant)
        .eq("is_forecast", False)
        .eq("location->>lat", str(lat)) 
        .eq("location->>long", str(lon))
        #If stored as float
        #.eq("location->>lat", lat)
        #.eq("location->>long", lon)
        .gte("recorded_at", start_time.isoformat())
        .lte("recorded_at", end_time.isoformat())
        .execute()
    )

    values = []

    for row in response.data:
        if row.get("readings", {}).get("value") is not None:
            values.append(float(row["readings"]["value"]))

    if not values:
        return None

    return sum(values) / len(values)



# -------------------------------------------------------
# MAIN CPCB AQI FUNCTION
# -------------------------------------------------------

def calculate_cpcb_aqi(lat: float, lon: float):

    pm25 = get_rolling_average(lat, lon, "pm2_5", 24)
    pm10 = get_rolling_average(lat, lon, "pm10", 24)
    no2 = get_rolling_average(lat, lon, "nitrogen_dioxide", 24)
    so2 = get_rolling_average(lat, lon, "sulphur_dioxide", 24)
    o3 = get_rolling_average(lat, lon, "ozone", 8)
    co = get_rolling_average(lat, lon, "carbon_monoxide", 8)

    sub_indices = {
        "PM2.5": calculate_sub_index(pm25, PM25_BREAKPOINTS),
        "PM10": calculate_sub_index(pm10, PM10_BREAKPOINTS),
        "NO2": calculate_sub_index(no2, NO2_BREAKPOINTS),
        "SO2": calculate_sub_index(so2, SO2_BREAKPOINTS),
        "O3": calculate_sub_index(o3, O3_BREAKPOINTS),
        "CO": calculate_sub_index(co, CO_BREAKPOINTS),
    }

    valid_indices = {k: v for k, v in sub_indices.items() if v is not None}

    if not valid_indices:
        return None, None, None

    dominant = max(valid_indices, key=valid_indices.get)
    aqi_value = valid_indices[dominant]

    category = get_aqi_category(aqi_value)

    return aqi_value, dominant, category


# -------------------------------------------------------
# AQI CATEGORY
# -------------------------------------------------------

def get_aqi_category(aqi):
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
    
def calculate_cpcb_aqi_instant(data):

    sub_indices = {
        "PM2.5": calculate_sub_index(data.get("pm2_5"), PM25_BREAKPOINTS),
        "PM10": calculate_sub_index(data.get("pm10"), PM10_BREAKPOINTS),
        "NO2": calculate_sub_index(data.get("nitrogen_dioxide"), NO2_BREAKPOINTS),
        "SO2": calculate_sub_index(data.get("sulphur_dioxide"), SO2_BREAKPOINTS),
        "O3": calculate_sub_index(data.get("ozone"), O3_BREAKPOINTS),
        "CO": calculate_sub_index(data.get("carbon_monoxide"), CO_BREAKPOINTS),
    }

    valid = {k: v for k, v in sub_indices.items() if v is not None}

    if not valid:
        return None, None, None

    dominant = max(valid, key=valid.get)
    aqi_value = valid[dominant]
    category = get_aqi_category(aqi_value)

    return aqi_value, dominant, category

