import asyncio
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from src.core.redis import get_redis_client
from src.core.config import settings

async def test_redis():
    print(f"Testing Redis Connection...")
    print(f"URL: {settings.REDIS_URL or 'None'}")
    print(f"Host: {settings.REDIS_HOST}:{settings.REDIS_PORT}")

    try:
        client = await get_redis_client()
        await client.set("test_key", "Hello Redis")
        val = await client.get("test_key")
        print(f"Retrieved Value: {val}")
        
        if val == "Hello Redis":
            print("✅ Redis Connection Successful!")
        else:
            print("❌ Value Mismatch")
            
        await client.aclose()
    except Exception as e:
        print(f"❌ Redis Connection Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_redis())
