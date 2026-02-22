from fastapi import APIRouter, Depends, HTTPException
from .schemas import RegisterRequest, LoginRequest, RefreshRequest
from src.api.deps import get_current_user, get_supabase_client
from src.core.logger import logger
from supabase import Client

router = APIRouter()

@router.post("/register")
async def register(data: RegisterRequest):
    supabase = get_supabase_client()
    try:
        # Supabase sign_up creates the user in auth.users
        # Triggers in DB will handle profile creation
        res = supabase.auth.sign_up({
            "email": data.email, 
            "password": data.password,
            "options": {
                "data": {
                    "full_name": data.full_name
                }
            }
        })
        if not res.user:
            logger.error("Registration failed: No user returned from Supabase")
            raise HTTPException(status_code=400, detail="Registration failed")
        return {"message": "User registered successfully, please check your email for verification if enabled."}
    except Exception as e:
        logger.error(f"Registration exception: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(data: LoginRequest):
    supabase = get_supabase_client()
    try:
        res = supabase.auth.sign_in_with_password({
            "email": data.email, 
            "password": data.password
        })
        return {
            "access_token": res.session.access_token, 
            "refresh_token": res.session.refresh_token,
            "token_type": "bearer"
        }
    except Exception as e:
        logger.error(f"Login exception: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/refresh")
async def refresh(data: RefreshRequest):
    supabase = get_supabase_client()
    try:
        res = supabase.auth.refresh_session(data.refresh_token)
        if not res.session:
             raise HTTPException(status_code=401, detail="Invalid refresh token")
        return {
            "access_token": res.session.access_token, 
            "refresh_token": res.session.refresh_token,
             "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    try:
        # Fetch profile data from 'profiles' table using the user ID
        # RLS ensures they can only see their own
        user_id = current_user.id
        response = supabase.table("profiles").select("*").eq("id", user_id).single()
        
        profile = response.data if response.data else None
        
        return {
            "user": {
                "id": current_user.id,
                "email": current_user.email,
                "metadata": current_user.user_metadata
            }, 
            "profile": profile
        }
    except Exception as e:
         # Fallback if profile fetch fails or doesn't exist yet
         return {
            "user": {
                 "id": current_user.id,
                 "email": current_user.email
            },
            "profile": None,
            "error": str(e)
         }

