# 🌍 PRAKRITI — Full Project Explained (For Complete Beginners)

Welcome! Let's break this project down from zero. Imagine you're looking at a map of a city — some parts are familiar, some aren't. By the end, you'll understand every district.

---

## 🧭 What is PRAKRITI?

**PRAKRITI** is a web application (a website you use in your browser) that acts like a **personalized environmental health advisor**. Think of it like a doctor who knows:
1. What the **air quality** and **weather** is like *right now at your location*
2. What kind of **person you are** — your hobbies, health conditions, personality
3. Then it combines **both** and tells you smart things like: *"You have asthma and outdoor affinity, but today's PM2.5 is dangerously high — stay indoors before 10 AM."*

This is fundamentally different from just showing weather. It *understands you* and *personalizes the data for you*.

---

## 🏗️ How a Web App Is Structured (Foundation)

Before the code, understand this mental model:

```
[User in Browser]  ←→  [Frontend (React)]  ←→  [Backend (FastAPI)]  ←→  [Databases & AI]
     👤                    🖥️ (Your screen)          🧠 (Logic engine)       💾🤖
```

- **Frontend**: What you SEE and CLICK (buttons, charts, cards). Built with **React**.
- **Backend**: The *brain* behind the scenes. You can't see it, but it processes your requests, fetches data, runs AI. Built with **FastAPI** (Python).
- **Databases**: Where data is permanently stored. PRAKRITI uses **Supabase** (a cloud database).
- **Cache (Redis)**: A super-fast temporary memory so you don't re-fetch the same data every second.
- **AI (LLM)**: A large language model (like ChatGPT) that writes personalized advice.

---

## 📁 Project Folder Structure

```
PRAKRITI/
├── backend/       ← Python server (the brain)
│   └── src/
│       ├── main.py         ← Entry point, registers all routes
│       ├── api/            ← All the "endpoints" (URL handlers)
│       ├── core/           ← Core engines (twin, aggregation, caching)
│       ├── langgraph/      ← AI multi-agent system
│       ├── llm/            ← AI model factory (Groq, Gemini, Grok)
│       └── services/       ← Business logic services (NGO, etc.)
│
└── frontend/      ← React website (what users see)
    └── src/
        ├── App.jsx         ← Root - defines all pages/routes
        ├── pages/          ← Full pages (Dashboard, Profile, etc.)
        ├── components/     ← Reusable UI pieces (cards, navbar, etc.)
        ├── context/        ← Global shared state (auth, theme, language)
        └── services/       ← API call helper
```

---

## 🚀 Part 1: The Backend — The Brain

### 1.1 Entry Point: `main.py`

This is where the backend *server starts*. Think of it as the **reception desk of a hotel** — it registers every department (auth, environment, chat, etc.) so requests know where to go.

```python
# backend/src/main.py

from fastapi import FastAPI

app = FastAPI(title="Techathon 3.0 PRAKRITI Backend")

# These are like "departments" being registered
app.include_router(auth_router,        prefix="/auth")        # Login/Signup
app.include_router(environment_router, prefix="/environment") # Air quality, weather
app.include_router(chat_router,        prefix="/chat")        # AI chatbot
app.include_router(dashboard_router,   prefix="/dashboard")   # AI briefings
app.include_router(ngo_router,         prefix="/ngo")         # NGO events
app.include_router(rewards_router,     prefix="/rewards")     # Gamification
# ... and more
```

**What `prefix="/auth"` means:** Every URL that starts with `/auth/` goes to the auth department. So `/auth/login` → login handler, `/auth/register` → register handler. Simple routing!

---

### 1.2 Authentication: Who Are You?

File: `backend/src/api/auth/views.py`

This handles **login, signup, and logout**. PRAKRITI uses **Supabase Auth** — a service that securely manages user passwords so the developers don't have to.

```python
@router.post("/register")
async def register(data: RegisterRequest):
    supabase = get_supabase_client()
    res = supabase.auth.sign_up({
        "email": data.email, 
        "password": data.password,
        "options": {"data": {"full_name": data.full_name}}
    })
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(data: LoginRequest):
    res = supabase.auth.sign_in_with_password({
        "email": data.email, 
        "password": data.password
    })
    return {
        "access_token": res.session.access_token,  # 🔑 Like a hotel key card
        "token_type": "bearer"
    }
```

**How tokens work (super simple):** When you log in, the server gives you a secret **access token** (like a temporary ID badge). Every future request you make carries this token. The server looks at it and says: *"Yes, this is Prathamesh, let him through."*

---

### 1.3 The Behavior Engine: Who Are You, *Really*?

File: `backend/src/core/twin_engine.py`

This is one of PRAKRITI's most innovative parts — the **Digital Twin Engine**. It builds a *mathematical model of you* from your questionnaire answers.

```python
class TwinEngine:

    def compute_environment_score(self, env: Dict[str, Any]) -> float:
        # Normalize pollutants into 0-2 range
        pm25 = normalize(env.get("pm2_5"), 50)   # Fine particles (most dangerous)
        pm10 = normalize(env.get("pm10"), 80)    # Coarse particles
        ozone = normalize(env.get("ozone"), 120)
        no2 = normalize(env.get("nitrogen_dioxide"), 100)
        uv = normalize(env.get("uv_index"), 10)

        temp_dev = abs((env.get("temperature") or 25) - 25) # How far from 25°C
        temp = normalize(temp_dev, 15)

        # Weighted formula: PM2.5 contributes 35% of the danger score
        return (
            0.35 * pm25 +
            0.20 * pm10 +
            0.15 * ozone +
            0.10 * no2 +
            0.10 * uv +
            0.10 * temp
        )

    def compute_health_multiplier(self, health: Dict[str, Any]) -> float:
        sensitivity = health.get("health_sensitivity", 1.0)
        diseases = health.get("diseases", [])
        # Each disease adds 15% more risk, max 60% extra
        disease_factor = min(len(diseases) * 0.15, 0.6)
        return 1 + sensitivity + disease_factor

    def compute_final_risk(self, env_score, activity_modifier, health_multiplier) -> float:
        raw = (env_score * health_multiplier) + activity_modifier
        # sigmoid() converts any number into 0-100 scale smoothly
        return round(sigmoid(raw) * 100, 2)
```

**Real example:** If PM2.5 is 75 μg/m³ (bad) and you have asthma (disease_factor adds 0.15), your `health_multiplier` becomes `1 + 1.0 + 0.15 = 2.15`. Your risk score is amplified 2.15× compared to a healthy person. That's the power of personalization.

---

### 1.4 Environment Data Collection

File: `backend/src/core/aggregate_data.py`

This class is the **central data librarian**. It knows where to get every piece of data from — the database, the cache, or external APIs.

```python
async def get_environment_snapshot(self, lat: float, lon: float):
    # 1. Check Redis cache first (super fast, 30-min TTL)
    cache_key = f"env:{round(lat,4)}:{round(lon,4)}"
    cached = await get_cache(cache_key)
    if cached:
        logger.info("⚡🚀 [REDIS CACHE HIT] Served instantly!")
        return cached

    # 2. Cache miss? Fetch from 3 external APIs simultaneously
    weather, air, waqi = await asyncio.gather(
        fetch_weather(lat, lon),     # Open-Meteo: temperature, humidity, UV, wind
        fetch_air_quality(lat, lon), # Open-Meteo: PM2.5, PM10, ozone, NO2
        fetch_waqi(lat, lon)         # WAQI: AQI composite score
    )

    # 3. Combine into one clean snapshot
    snapshot = {
        "temperature": weather.get("current", {}).get("temperature_2m"),
        "humidity": weather.get("current", {}).get("relative_humidity_2m"),
        "pm2_5": air.get("hourly", {}).get("pm2_5", [None])[0],
        "aqi": waqi.get("aqi") if waqi else None,
        # ... more fields
    }

    await set_cache(cache_key, snapshot, ttl=1800)  # Cache for 30 min
    return snapshot
```

**Why `asyncio.gather`?** Instead of fetching weather, *then* air quality, *then* AQI one by one (slow — sequential), `asyncio.gather` fires all 3 requests **at the same time** and waits for all to finish. It's like opening 3 browser tabs simultaneously instead of one after the other.

---

### 1.5 The AI System (LangGraph Multi-Agent)

File: `backend/src/langgraph/supervisor.py`

This is the **AI routing brain**. When you send a chat message, the Supervisor agent decides *which specialized AI agent* should answer it.

```python
async def supervisor_agent(state, datastore):
    # 1. Build your full digital twin context
    twin_context = await datastore.build_full_context(user_id, lat, lon)
    # Now the AI knows: your risk score, your behavior profile, current environment

    # 2. Ask the LLM: which specialist should handle this?
    routing_prompt = f"""
    Classify this query into ONE of:
    1. "environment_analyst": deep AQI/weather analysis
    2. "micro_learner": user wants to learn something (What is PM2.5?)
    3. "chatbot": casual conversation

    USER QUERY: "{query}"
    Return JSON: {{"agent": "chatbot"}}
    """
    response = await llm.ainvoke([HumanMessage(content=routing_prompt)])
    next_agent = json.loads(response.content)["agent"]

    # 3. Pass to the right specialist
    return {"next_agent": next_agent, "structured_data": structured_data}
```

**It's like a hospital reception:** You walk in and say *"My chest hurts."* The receptionist routes you to cardiology, not dermatology. The Supervisor reads your message and routes to the right AI specialist.

### 1.6 Dashboard AI Features

File: `backend/src/api/dashboard/views.py`

Three AI-powered features run in parallel on the dashboard:

```python
@router.get("/daily-briefing")
async def get_daily_briefing(lat, lon, user):
    # Generate a 2-3 sentence morning briefing using LLM
    pass

@router.get("/env-insights")
async def get_env_insights(lat, lon, user):
    # Generate insights for ALL 9 metrics in PARALLEL
    results = await asyncio.gather(
        *[_insight_for_metric(key, env.get(key), env, behavior) 
          for key in ["aqi", "temperature", "humidity", "wind_speed", 
                      "uv_index", "pm2_5", "pm10", "ozone", "nitrogen_dioxide"]]
    )
    # Result: {"aqi": "Today's AQI of 145...", "temperature": "At 38°C this..."}
```

This is making **9 simultaneous AI calls** to generate a personalized sentence for each metric card on your dashboard. Example output for PM2.5: *"At 78 μg/m³, fine particles are at a concerning level. Given your mild asthma, this could trigger symptoms during exercise. Consider keeping windows closed and using an air purifier indoors."*

---

### 1.7 Redis: The Speed Layer

File: `backend/src/core/redis.py`

**What Redis does:** Redis is like a **sticky note pad** on your desk. Instead of going to the filing cabinet (Supabase database — slow) or calling the weather API every time, Redis holds the data in RAM (super fast). Weather data is cached for 30 minutes. AI insights for 3 hours. This makes PRAKRITI respond in milliseconds instead of seconds.

---

## 🖥️ Part 2: The Frontend — What You See

### 2.1 App.jsx — The Map of the Website

```jsx
// frontend/src/App.jsx
function App() {
  return (
    <ThemeProvider>        {/* Dark/Light mode for whole app */}
      <LanguageProvider>   {/* Multi-language support */}
        <AuthProvider>     {/* Login state for whole app */}
          <Router>
            <Routes>
              <Route path="/"          element={<LandingPage />} />
              <Route path="/login"     element={<Login />} />
              <Route path="/signup"    element={<Signup />} />
              
              {/* Protected: only logged-in users can access */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile"   element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              <Route path="/assessment" element={
                <ProtectedRoute><Questionnaire /></ProtectedRoute>
              } />
            </Routes>
            <ChatWidget />  {/* AI chat bubble on every page */}
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
```

**`<ProtectedRoute>`** is a guard. If a non-logged-in user tries to visit `/dashboard`, it redirects them to `/login` automatically.

---

### 2.2 AuthContext — Global Login State

File: `frontend/src/context/AuthContext.jsx`

This handles login state across the entire app. When you log in, it saves a `token` in `localStorage` securely so you stay logged in even after refreshing the browser.

---

### 2.3 Dashboard.jsx — The Heart of the App

File: `frontend/src/pages/Dashboard.jsx`

This is the most complex page. It:
1. Detects your location via IP
2. Fetches your profile + environment data
3. Fetches AI briefings
4. Displays everything with animated metric cards

```jsx
// 9 metric cards defined here
const metrics = [
    { icon: Gauge, label: "AQI", value: envData?.aqi, insight: envInsights['aqi'] },
    { icon: Thermometer, label: "Temp", value: envData?.temperature, unit: "°C" },
    // ... 7 more
];
```

**`useState`** is React's memory. `setEnvData(data)` stores the environment data so React can display it. When state changes, React automatically re-renders the UI.

**`useEffect`** is React's way of running code *after* the page renders. It's used for fetching data, because you can't fetch data *during* rendering.

---

### 2.4 The MetricCard + Modal — Animated UI

Using **`framer-motion`**, the cards softly animate natively: `whileHover={{ y: -3 }}` pushes the card up 3 pixels when hovered. When clicked, it renders a large model featuring the custom AI explanation mapped exactly to that user.

---

### 2.5 The Questionnaire — Building Your Behavior Profile

File: `frontend/src/components/Questionnaire.jsx`

When you first sign up, you go through a **6-step assessment** answering 10 Likert-scale questions, diseases, interests, and hobbies. This data gets converted to algorithmic vectors by `backend/src/core/twin_engine.py` to create the digital twin.

---

## 🔄 Part 3: How a Single Request Flows End-to-End

Let's trace exactly what happens when you open the **Dashboard** page:

```
1. Browser loads Dashboard.jsx
        ↓
2. useEffect fires → fetch('ipapi.co') → get lat=28.6, lon=77.2
        ↓
3. Simultaneously fire 4 API calls:
   → GET /user/profile
   → GET /environment/current
   → GET /dashboard/daily-briefing
   → GET /dashboard/emotional-ux
        ↓
4. Backend receives /environment/current:
   → Check Redis cache (Cache hit? Return instantly ⚡)
   → Cache miss? Call external APIs simultaneously
   → Store result in Redis for 30 min and return it
        ↓  
5. Frontend receives all data, renders MetricCards with live values.
        ↓
6. SECOND useEffect fires (after userData & envData are ready):
   → GET /dashboard/env-insights (9 LLM calls in parallel)
   → UI updates dynamically with the explanations when finished resolving.
```

---

## 🧩 Part 4: NGO Events Feature

File: `backend/src/api/ngo/views.py`

This uses the **Tavily API** to search for real NGO environmental events in your city, then uses **vector similarity** (pgvector in Supabase) to rank them by how relevant they are to *your* interest profile.

---

## 🔒 Part 5: Security

**Row-Level Security (RLS)** in Supabase means:
> Even if someone hacked the database URL, they can still only see *their own* data. Every query automatically adds `WHERE user_id = 'your-id'`.

**JWT Tokens:** When you log in, you get a cryptographically signed token. The backend validates this token's signature on every request. It's impossible to fake.

---

## 🌟 What Makes PRAKRITI Unique

| Standard Weather App | PRAKRITI |
|---------------------|---------|
| Shows AQI: 145 | "AQI 145 is dangerous *for you* because your asthma amplifies risk by 2.15×" |
| Shows temperature: 38°C | "38°C combined with your high outdoor affinity creates conflict — limit outdoor time" |
| Same advice for everyone | Different advice for every person, personalized to their health + behavior profile |
| Static data display | AI-generated morning briefing, mood prediction, metric insights |

The core innovation is that **the same environmental data produces different outputs for different people** — a mathematical behavioral model bridges the gap between *universal data* and *personal impact*.
