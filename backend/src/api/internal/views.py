from fastapi import APIRouter, Header, HTTPException, Depends

router = APIRouter()

async def verify_service_token(x_service_token: str = Header(None)):
    if x_service_token != "super-secret-token":
        raise HTTPException(status_code=403, detail="Invalid service token")

@router.post("/recompute-twin", dependencies=[Depends(verify_service_token)])
async def recompute_twin():
    return {"status": "ok", "job_id": "123"}

@router.post("/recalculate-achievements", dependencies=[Depends(verify_service_token)])
async def recalculate_achievements():
    return {"status": "ok", "job_id": "124"}

@router.post("/cache-environment", dependencies=[Depends(verify_service_token)])
async def cache_environment():
    return {"status": "ok", "job_id": "125"}
