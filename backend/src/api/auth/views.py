from fastapi import APIRouter, Depends
from .schemas import RegisterRequest, LoginRequest, RefreshRequest
from src.api.deps import get_current_user

router = APIRouter()

@router.post("/register")
async def register(data: RegisterRequest):
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(data: LoginRequest):
    return {"access_token": "fake_jwt_token", "refresh_token": "fake_refresh_token"}

@router.post("/refresh")
async def refresh(data: RefreshRequest):
    return {"access_token": "new_fake_jwt_token"}

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    return {"message": "Logged out successfully"}

@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user, "profile": "User Profile Summary"}
