import redis.asyncio as redis
from src.core.config import settings
from src.core.logger import logger

_redis_client: redis.Redis | None = None

async def get_redis_client() -> redis.Redis:
    """
    Returns a configured Redis client (Singleton).
    Prioritizes REDIS_URL (Render/Prod) over REDIS_HOST/PORT (Local).
    """
    global _redis_client
    if _redis_client is not None:
        return _redis_client

    if settings.REDIS_URL:
        logger.info(f"Connecting to Redis via URL: {settings.REDIS_URL.split('@')[-1]}") # Log safe part of URL
        _redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    else:
        logger.info(f"Connecting to Redis via Host: {settings.REDIS_HOST}:{settings.REDIS_PORT}")
        _redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            decode_responses=True
        )
    return _redis_client
