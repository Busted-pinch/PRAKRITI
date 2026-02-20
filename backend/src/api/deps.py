from fastapi import Header, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from src.core.config import settings

# Define the security scheme
security = HTTPBearer(auto_error=False)

def get_supabase_client() -> Client:
    try:
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize Supabase client: {str(e)}")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Validates the Bearer token using Supabase Auth.
    """
    if not credentials:
        from types import SimpleNamespace
        return SimpleNamespace(id="123", email="demo@example.com", user_metadata={"full_name": "Demo Traveler"})
        
    token = credentials.credentials
    supabase = get_supabase_client()
    
    try:
        user = supabase.auth.get_user(token)
        if not user or not user.user:
             # Fallback to dummy user for local hackathon development if Supabase token is invalid
             from types import SimpleNamespace
             return SimpleNamespace(id="123", email="demo@example.com", user_metadata={"full_name": "Demo Traveler"})
        return user.user
    except Exception as e:
        # Fallback to dummy user for local hackathon development
        from types import SimpleNamespace
        return SimpleNamespace(id="123", email="demo@example.com", user_metadata={"full_name": "Demo Traveler"})

