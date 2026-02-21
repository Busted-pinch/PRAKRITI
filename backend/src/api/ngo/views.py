from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.api.deps import get_current_user, get_supabase_client
from src.services.ngo_service import get_recommended_ngo_events
from src.schemas.ngo import NGORecommendationResponse

router = APIRouter()

# Optional bearer — won't raise 401 if token is absent/invalid
_optional_bearer = HTTPBearer(auto_error=False)

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(_optional_bearer)):
    """Returns the Supabase user if the token is valid, else None (no 401 raised)."""
    if not credentials or not credentials.credentials:
        return None
    try:
        supabase = get_supabase_client()
        result = supabase.auth.get_user(credentials.credentials)
        if result and result.user:
            return result.user
    except Exception:
        pass
    return None


@router.get("/recommendations", response_model=NGORecommendationResponse)
async def get_recommendations(
    locality: str = Query(..., description="The city or locality to search for events (e.g., 'Mumbai')"),
    current_user=Depends(get_optional_user),
):
    """
    Fetch personalized NGO event recommendations for the current user in a specific locality.
    Falls back gracefully if auth fails — still returns locality-based results.
    """
    try:
        # Use real user_id for personalization if authenticated, else generic key
        if current_user is not None:
            user_id = str(current_user.id) if hasattr(current_user, 'id') else str(current_user.get('id', 'anonymous'))
        else:
            user_id = f"anonymous_{locality.lower()}"

        result = await get_recommended_ngo_events(user_id=user_id, locality=locality)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

