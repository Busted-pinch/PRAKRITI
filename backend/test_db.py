import asyncio
from src.core.supabase_client import supabase

async def test_insert():
    try:
        # We try to manually insert a profile. This will fail, but the error
        # will tell us exactly what's wrong with our schema
        print("Attempting manual profile insert to catch schema errors...")
        res = supabase.table("profiles").insert({
            "id": "00000000-0000-0000-0000-000000000000", # Fake UUID
            "email": "test@error.com",
            "full_name": "Test Error"
        }).execute()
        
        print("Success? (This shouldn't happen):", res)
    except Exception as e:
        print("\n\n=== THE EXACT DATABASE ERROR IS ===")
        print(e)
        print("===================================\n\n")

if __name__ == "__main__":
    asyncio.run(test_insert())
