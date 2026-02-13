from fastapi import FastAPI
from src.core.logger import logger

app = FastAPI(title="Techathon Backend")

@app.on_event("startup")
async def startup_event():
    logger.info("Application startup")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutdown")

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "Hello Techathon"}
