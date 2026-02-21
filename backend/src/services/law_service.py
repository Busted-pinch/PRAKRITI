import time
from src.core.cache import get_cache, set_cache
from src.core.supabase_client import supabase
import logging

logger = logging.getLogger(__name__)

CACHE_KEY = "global_laws_v1"
CACHE_TTL = 7 * 24 * 60 * 60  # 7 days

class LawService:
    async def fetch_environmental_laws(self):
        # 1. Check Redis Cache
        cached_laws = await get_cache(CACHE_KEY)
        if cached_laws:
            logger.info("\n⚡🚀 [REDIS CACHE HIT] Served global laws instantly!\n")
            return cached_laws

        logger.info("\n🐌🌐 [DB FETCH] Cache Miss. Fetching Laws from Supabase...\n")

        try:
            # 2. Fetch from Supabase
            response = supabase.table("laws").select("*").execute()
            laws_data = response.data or []
            
            # 3. Store in Redis
            if laws_data:
                await set_cache(CACHE_KEY, laws_data, ttl=CACHE_TTL)
                
            return laws_data
        except Exception as e:
            logger.error(f"Error fetching laws from Supabase: {e}")
            return []

law_service = LawService()
