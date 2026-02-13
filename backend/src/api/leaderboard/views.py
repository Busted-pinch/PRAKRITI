from fastapi import APIRouter, Depends
from src.api.deps import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/global")
async def get_global_leaderboard():
    return [{"rank": 1, "name": "Alice", "score": 9000}]

@router.get("/local")
async def get_local_leaderboard():
    return [{"rank": 1, "name": "Neighbor Bob", "score": 8500}]

@router.get("/friends")
async def get_friends_leaderboard():
    return [{"rank": 1, "name": "Friend Charlie", "score": 8800}]
