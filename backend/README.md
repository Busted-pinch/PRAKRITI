# Techathon 3.0 PRAKRITI Backend

## Overview

This is the backend service for the PRAKRITI platform, built with FastAPI and managed by Poetry. It provides APIs for authentication, user management, environmental data, simulations, and AI-driven interactions.

## Features

- **Auth**: User authentication and management.
- **Digital Twin**: User profile and digital twin state management.
- **Environment**: Real-time and historical environmental data (AQI, Weather).
- **Simulation**: Predictive models for impact analysis.
- **Chat**: Real-time AI chatbot with WebSocket support.
- **Growth**: Achievement system and microlearning content.
- **Leaderboard**: Global and local user rankings.
- **Privacy**: Data export and account deletion.

## Project Structure

- `src/api`: Contains all API route definitions (views) and Pydantic models (schemas).
- `src/core`: Core configurations, logging, and utilities.
- `src/main.py`: Application entry point and router registration.
- `src/__main__.py`: Entry point for running the application via module.

## Setup & Running

1. **Install Dependencies**
   Ensure you have Poetry installed, then run:
   ```bash
   poetry install
   ```

2. **Run Application**
   Start the server with hot-reloading enabled:
   ```bash
   poetry run python -m src
   ```

3. **Access Documentation on running the application**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Dependencies

Key libraries used:
- `fastapi`: Web framework.
- `uvicorn`: ASGI server.
- `pydantic`: Data validation.
- `sqlalchemy` / `supabase`: Database interaction.
- `redis`: Caching.
- `langgraph` / `langchain`: AI agent orchestration.
- `loguru`: Logging.
