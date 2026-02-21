import asyncio
from src.services.ngo_service import get_recommended_ngo_events
from src.core.supabase_client import supabase

async def test_all():
    print("1. Checking DB...")
    try:
        res = supabase.table("ngo_events").select("id").limit(1).execute()
        print("✅ DB 'ngo_events' table exists.")
    except Exception as e:
        print(f"❌ DB Error: {e}")
        print("Make sure you ran the SQL in the Supabase Dashboard!")
        return

    print("\n2. Testing end-to-end recommendation flow (Tavily + Embedding + RPC)...")
    try:
        # Dummy user UUID, doesn't matter much just for context
        res = await get_recommended_ngo_events(user_id="00000000-0000-0000-0000-000000000000", locality="San Francisco")
        print("✅ Success!")
        print(f"Source: {res.get('source')}")
        for event in res.get('events', []):
            print(f" - [{event.similarity:.2f}] {event.ngo_name}: {event.event_title} ({event.location})")
    except Exception as e:
        print(f"❌ Flow Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_all())
