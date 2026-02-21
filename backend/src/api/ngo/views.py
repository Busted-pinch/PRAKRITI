from fastapi import APIRouter, Depends, HTTPException, Query
from src.api.deps import get_current_user
from src.services.ngo_service import get_recommended_ngo_events
from src.schemas.ngo import NGORecommendationResponse

router = APIRouter()

@router.get("/recommendations", response_model=NGORecommendationResponse)
async def get_recommendations(
    locality: str = Query(..., description="The city or locality to search for events (e.g., 'San Francisco', 'Mumbai')"),
    current_user: any = Depends(get_current_user)
):
    """
    Fetch personalized NGO event recommendations for the current user in a specific locality.
    """
    try:
        user_id = str(current_user.id)
        result = await get_recommended_ngo_events(user_id=user_id, locality=locality)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
