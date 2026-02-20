import os
import httpx
from dotenv import load_dotenv

load_dotenv()

WAQI_TOKEN = os.getenv("WAQI_TOKEN")

async def fetch_waqi(lat: float, lon: float):
    url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={WAQI_TOKEN}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    data = response.json()

    if data.get("status") != "ok":
        return None

    return data.get("data", {})