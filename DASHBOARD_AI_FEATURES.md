# PRAKRITI – Dashboard AI Features: Chat History

**Date:** 2026-02-22 | **Session:** Contextualized Daily Briefing & Emotional UX Layer

---

## 🎯 Feature Request

Two new AI-powered modules to be shown on the Dashboard:

### 2️⃣ Contextualized Daily Briefing
Morning summary comparing:
- Today vs yesterday (temperature, humidity, AQI)
- Seasonal average comparison
- Anomaly highlights
- Actionable advice (e.g. "Ideal time for outdoor tasks: before 10 AM")

### 9️⃣ Emotional UX Layer
Weather-based mood/productivity insights, e.g.:
- "Clear skies today — good day for focus work."
- "Heavy humidity may reduce mental alertness."

**Source of data:** `AggregateData.get_environment_snapshot()` + `get_behavior_profile()` → sent to **Grok LLM** → returned to dashboard.

---

## 🛠 Implementation Summary

### Backend

#### New File: `backend/src/api/dashboard/views.py`
- Single file containing both endpoints
- `call_grok(prompt)` — async helper that calls `https://api.x.ai/v1/chat/completions` using `GROK_API_KEY` via `httpx`
- `GET /dashboard/daily-briefing?lat=&lon=` — fetches environment snapshot + behavior profile, builds contextual prompt, returns `{"briefing": "..."}` (cached 3h in Redis)
- `GET /dashboard/emotional-ux?lat=&lon=` — similar flow, returns `{"insight": "..."}` (cached 3h in Redis)

#### Modified: `backend/src/core/open_meteo_client.py`
- Added `fetch_historical_weather()` (added but later removed from usage to avoid complexity)

#### Modified: `backend/src/main.py`
- Registered `dashboard_router` under `/dashboard` prefix

#### Modified: `backend/src/langgraph/agents/news_agent.py`
- Removed deprecated `google.generativeai` / `gemini-1.5-pro-latest`
- Now calls `grok-2-1212` via `httpx` synchronously
- Strips markdown fences from LLM response before JSON parsing

#### Modified: `backend/src/langgraph/agents/law_agent.py`
- Same: removed Gemini, now uses Grok `grok-2-1212`

### Frontend

#### New File: `frontend/src/components/ContextualBriefing.jsx`
- Displays Daily Briefing text using `GlassCard`, `Sun` icon

#### New File: `frontend/src/components/EmotionalUX.jsx`
- Displays Emotional UX insight using `GlassCard`, `Heart` icon

#### Modified: `frontend/src/pages/Dashboard.jsx`
- Added state: `dailyBriefing`, `emotionalInsight`
- Fetches `/dashboard/daily-briefing` and `/dashboard/emotional-ux` in parallel with existing API calls
- Renders `<ContextualBriefing>` and `<EmotionalUX>` in the right column above the map

---

## 🐛 Bugs Fixed

| Error | Root Cause | Fix |
|---|---|---|
| `TypeError: 'User' object is not subscriptable` | Used `user["id"]` but FastAPI returns a User object | Changed to `getattr(user, "id", "demo-id")` |
| `postgrest.exceptions.APIError: 'behavior_environment_conflict' column not found` | `build_full_context()` calls `TwinEngine` which references missing DB column | Replaced `build_full_context()` with direct calls to `get_environment_snapshot()` + `get_behavior_profile()` |
| `400 Bad Request` from Grok API | Wrong model name (`grok-2-latest`, `grok-beta`) | Updated to correct model name: `grok-2-1212` |
| `404 models/gemini-1.5-pro-latest` in News & Law | Old Gemini model deprecated | Rewrote both agents to use Grok via `httpx` |

---

## 🔑 Key Design Decisions

- **No Digital Twin data** – endpoints only use environment snapshot + user behavior profile as per user requirement
- **No mock data** – all data is real, fetched from Open-Meteo API / WAQI / Supabase
- **No abstract LLM client** – Grok is called directly via `httpx` with a raw prompt
- **Redis caching** – both insights are cached for 3 hours to avoid unnecessary LLM calls
- **Graceful degradation** – if Grok call fails, returns `"Insight unavailable."` rather than crashing
