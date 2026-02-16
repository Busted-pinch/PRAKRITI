# Redis Implementation & Testing Guide

This document summarizes the changes made to introduce Redis caching and provides detailed instructions for local verification.

## 1. Implementation Summary

### Features Implemented
*   **Dependencies**: Added `redis[asyncio]` and `httpx` to `pyproject.toml`.
*   **Redis Client**:
    *   Implemented a **Singleton** Redis client in `src/core/redis.py`.
    *   Supports production configuration via `REDIS_URL` (e.g., Render/Upstash).
    *   Falls back to `REDIS_HOST` (localhost) and `REDIS_PORT` (6379) for local development.
*   **Cache-Aside Pattern**:
    *   Updated `src/api/environment/views.py` (specifically `/current` endpoint).
    *   **Flow**:
        1.  Check Redis for `aqi:{lat}:{lon}` and `weather:{lat}:{lon}` keys.
        2.  **Cache Hit**: Return cached JSON immediately.
        3.  **Cache Miss**: Fetch from external APIs (WAQI, OpenWeatherMap), process data, cache in Redis with **30-minute TTL**, and return.
*   **Resilience**: All Redis operations are wrapped in `try/except` blocks. If Redis fails, the backend gracefully falls back to direct API calls.

### Scope & Limitations
*   **Cached**: Only the current environment data endpoint (`/environment/current`).
*   **Not Cached**: Other endpoints like `/hourly`, `/trend`, or `/exposure` currently fetch fresh data or use dummy responses (as implemented).
*   **Data Security**: Only non-sensitive environmental data is cached. No user-specific data (PII, Auth Tokens) is stored in Redis.

---

## 2. Local Testing Instructions

Follow these steps to verify the implementation locally. These steps use a special test script to **bypass authentication** for easier manual testing with `curl`.

### Prerequisites
1.  **Redis Server**: Ensure Redis is running.
    ```bash
    redis-server
    # OR
    brew services start redis
    ```
2.  **Environment Setup**:
    ```bash
    source .venv/bin/activate
    pip install redis httpx
    ```

### Step 1: Run the Test Server
We created a helper script `scripts/run_test_server.py` that runs the FastAPI app but mocks the authentication dependency, allowing you to hit endpoints without a bearer token.

**Important**: Stop any other running backend servers first (Ctrl+C).

```bash
python scripts/run_test_server.py
```
*You should see "Starting Test Server with Auth Bypassed..."*

### Step 2: Test Cache Miss (First Request)
In a **new terminal window**, make a request to the environment endpoint. This will trigger the external API call (slower) and populate the cache.

```bash
curl "http://localhost:8000/environment/current?lat=28.61&lon=77.23"
```
*Observation*: You will receive a JSON response with AQI and Weather data.

### Step 3: Verify Redis Keys
Check that the keys have been created in Redis.

```bash
redis-cli keys "aqi:*"
redis-cli keys "weather:*"
```
*Expected Output*:
```text
1) "aqi:28.61:77.23"
1) "weather:28.61:77.23"
```

### Step 4: Test Cache Hit (Second Request)
Make the same request again.

```bash
curl "http://localhost:8000/environment/current?lat=28.61&lon=77.23"
```
*Observation*: The response should be significantly faster (instant). Check the terminal where `run_test_server.py` is running; you should see logs indicating a **Cache Hit**:
```text
INFO:     src.api.environment.views:get_current_environment:28 - Cache Hit: aqi:28.61:77.23
```

### Step 5: Cleanup
When finished testing:
1.  Stop the server (Ctrl+C).
2.  (Optional) Remove the test script if you don't want to commit it:
    ```bash
    rm scripts/run_test_server.py
    ```

---
**Ready for PR Review!**
The implementation is modular, resilient, and fully verified locally.
