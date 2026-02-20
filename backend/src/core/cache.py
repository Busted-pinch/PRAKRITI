import json
from typing import Any, Optional
from src.core.redis import get_redis_client

DEFAULT_TTL = 1800  # 30 minutes

async def get_cache(key: str) -> Optional[Any]:
    try:
        client = await get_redis_client()
        value = await client.get(key)
        if value:
            return json.loads(value)
    except Exception:
        pass
    return None


async def set_cache(key: str, value: Any, ttl: int = DEFAULT_TTL):
    try:
        client = await get_redis_client()
        await client.set(key, json.dumps(value), ex=ttl)
    except Exception:
        pass