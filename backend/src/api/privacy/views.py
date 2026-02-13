from fastapi import APIRouter, Depends
from src.api.deps import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/export")
async def export_data(current_user: dict = Depends(get_current_user)):
    return {
        "profile": current_user,
        "history": [],
        "logs": []
    }

@router.delete("/delete-account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    return {"message": "Account scheduled for deletion"}
