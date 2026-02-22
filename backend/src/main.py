from fastapi import FastAPI
from src.core.logger import logger
from src.core.redis import get_redis_client
from src.api.auth.views import router as auth_router
from src.api.user.views import router as user_router
from src.api.environment.views import router as environment_router
from src.api.simulation.views import router as simulation_router
from src.api.chat.views import router as chat_router
from src.api.growth.views import router as growth_router
from src.api.leaderboard.views import router as leaderboard_router
from src.api.privacy.views import router as privacy_router
from src.api.internal.views import router as internal_router
from src.api.session.views import router as session_router
from src.api.interaction.views import router as interaction_router
from src.api.behavior.views import router as system_behavior_router
from src.api.user.behavior.views import router as user_behavior_router
from src.api.news.views import router as news_router
from src.api.law.views import router as law_router
from src.api.ngo.views import router as ngo_router
from src.api.map_routes import router as map_router
from src.api.dashboard.views import router as dashboard_router
from src.api.rewards.views import router as rewards_router




from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Techathon 3.0 PRAKRITI Backend",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS Configuration
origins = [
    "*", 
    "https://prakriti-teal.vercel.app/",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(user_router, prefix="/user", tags=["User"])
app.include_router(environment_router, prefix="/environment", tags=["Environment"])
app.include_router(simulation_router, prefix="/simulation", tags=["Simulation"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])
app.include_router(growth_router, prefix="/growth", tags=["Growth"])
app.include_router(leaderboard_router, prefix="/leaderboard", tags=["Leaderboard"])
app.include_router(privacy_router, prefix="/privacy", tags=["Privacy"])
app.include_router(internal_router, prefix="/internal", tags=["Internal"])
app.include_router(user_behavior_router, prefix="/user", tags=["User Attributes"])
app.include_router(system_behavior_router, prefix="/behavior", tags=["Behavior"])
app.include_router(news_router, prefix="/news", tags=["News Intelligence"])
app.include_router(law_router, prefix="/law", tags=["Law & Policy"])
app.include_router(ngo_router, prefix="/ngo", tags=["NGO Events"])
app.include_router(map_router, prefix="", tags=["Map"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(rewards_router, prefix="/rewards", tags=["Rewards"])


@app.on_event("startup")
async def startup_event():
    logger.info("Application startup")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutdown")
    try:
        client = await get_redis_client()
        await client.aclose()
    except:
        pass

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "Hello Techathon"}

app.include_router(session_router, prefix="/session", tags=["Session"])
app.include_router(interaction_router, prefix="/interaction", tags=["Interaction"])

