import requests
from src.schemas.aggregate import EnvironmentData

def fetch_environment_from_api(lat: float, lon: float) -> EnvironmentData:
    """
    Fetches weather data from Open-Meteo API.
    """
    try:
        response = requests.get(
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true",
            timeout=10
        )
        response.raise_for_status()
        weather = response.json()
        
        return EnvironmentData(
            session_id="",  # Placeholder, will be set by caller
            temperature=weather["current_weather"]["temperature"],
            weather=str(weather["current_weather"]["weathercode"]),
        )
    except Exception as e:
        # In a real app we might log this or raise a specific exception
        print(f"Error fetching environment API: {e}")
        # Return a fallback or re-raise
        raise e
