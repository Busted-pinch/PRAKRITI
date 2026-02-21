import os
import json
import httpx
from datetime import datetime
from uuid import uuid4
from src.core.redis import get_redis_client
from src.core.supabase_client import supabase
from src.schemas.ngo import NGOEventResponse

try:
    from sentence_transformers import SentenceTransformer
    has_st = True
    # Initialize the model at the module level so it's loaded only once
    embedder = SentenceTransformer('all-MiniLM-L6-v2')
except ImportError:
    has_st = False
    embedder = None

async def get_embedding(text: str) -> list[float]:
    """Generates embedding using sentence-transformers (all-MiniLM-L6-v2)."""
    if not has_st or embedder is None:
        print("WARNING: sentence-transformers not found. Returning fake embedding.")
        return [0.0] * 384
    
    try:
        # Convert numpy array to list of floats
        embedding = embedder.encode(text).tolist()
        return embedding
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return [0.0] * 384

async def fetch_ngo_events_from_tavily(locality: str) -> list[dict]:
    """Fetch NGO events using Tavily API and cache the results."""
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        print("WARNING: TAVILY_API_KEY not configured. Simulating empty results.")
        return []

    redis = await get_redis_client()
    cache_key = f"tavily:ngo_events:{locality.lower().replace(' ', '_')}"
    
    # Check cache
    try:
        cached_data = await redis.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        print(f"Redis cache read error: {e}")

    # Fetch from Tavily
    url = "https://api.tavily.com/search"
    query = f"upcoming local NGO events, volunteer opportunities, community events happening in {locality}"
    payload = {
        "api_key": api_key,
        "query": query,
        "search_depth": "advanced",
        "include_answer": False,
        "include_raw_content": False,
        "max_results": 5
    }

    results = []
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=15.0)
            if response.status_code == 200:
                data = response.json()
                for item in data.get("results", []):
                    results.append({
                        "ngo_name": item.get("title", "Unknown NGO via Tavily").split(" - ")[0],
                        "event_title": item.get("title", "Community Event"),
                        "description": item.get("content", ""),
                        "location": locality,
                        "source_url": item.get("url", "")
                    })
                
                # Cache results for 24 hours
                try:
                    await redis.setex(cache_key, 86400, json.dumps(results))
                except Exception as e:
                    print(f"Redis cache write error: {e}")
            else:
                print(f"Tavily API error: {response.text}")
    except Exception as e:
        print(f"Tavily Request error: {e}")

    return results

async def ingest_events_to_db(events: list[dict]):
    """Embed and store events in the Supabase database."""
    for event in events:
        # Generate text to embed
        text_to_embed = f"{event.get('ngo_name')} {event.get('event_title')} {event.get('description')} {event.get('location')}"
        embedding = await get_embedding(text_to_embed)
        
        # We try to insert. If it exists, we could use upsert. For now, simple insert.
        try:
            insert_data = {
                **event,
                "embedding": list(embedding)
            }
            supabase.table("ngo_events").insert(insert_data).execute()
        except Exception as e:
            print(f"Failed to insert event to Supabase: {e}")

async def get_user_profile_text(user_id: str) -> str:
    """Fetch user behavior profile to build embedding context."""
    try:
        res = supabase.table("behavior_profiles").select("behavior_model, selected_interests").eq("user_id", user_id).execute()
        if res.data and len(res.data) > 0:
            profile = res.data[0]
            interests = profile.get("selected_interests", [])
            behavior = profile.get("behavior_model", {})
            return f"interests: {', '.join(interests)}. behaviors: {json.dumps(behavior)}"
    except Exception as e:
        print(f"Error fetching user profile context: {e}")
    return "general volunteering community service"

async def get_recommended_ngo_events(user_id: str, locality: str) -> dict:
    """End-to-end flow: Generate user embedding -> RPC Vector Search."""
    # 1. Fetch user context
    user_context = await get_user_profile_text(user_id)
    
    # 2. Add locality to context to bias embeddings towards the locality
    query_text = f"User looking for events in {locality}. Context: {user_context}"
    user_embedding = await get_embedding(query_text)

    # 3. Vector Similarity Search via RPC in Supabase
    try:
        # Threshold 0.5 can be tuned, we ask for top 10
        rpc_params = {
            "query_embedding": list(user_embedding),
            "match_threshold": 0.5,
            "match_count": 10
        }
        res = supabase.rpc("match_ngo_events", rpc_params).execute()
        events = res.data

        # 4. If nothing returned, fallback to Tavily to fetch new events for this locality
        if not events or len(events) == 0:
            print("No local events found in Vector DB. Fetching from Tavily...")
            fetched = await fetch_ngo_events_from_tavily(locality)
            if fetched:
                await ingest_events_to_db(fetched)
                # Re-run search
                res = supabase.rpc("match_ngo_events", rpc_params).execute()
                events = res.data

        if events:
            # Map back to schemas
            mapped_events = []
            for e in events:
                mapped_events.append(NGOEventResponse(
                    id=str(e.get("id")),
                    ngo_name=e.get("ngo_name", ""),
                    event_title=e.get("event_title", ""),
                    description=e.get("description"),
                    location=e.get("location"), # Not returned by RPC unless updated, but works
                    similarity=e.get("similarity")
                ))
            return {"events": mapped_events, "source": "database"}
        
        return {"events": [], "source": "tavily"}
    except Exception as e:
        print(f"Error during recommendation: {e}")
        # Gracefully handle the case if user hasn't created the RPC or tables
        return {"events": [], "source": "error"}
