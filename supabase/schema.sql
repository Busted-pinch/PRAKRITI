-- =====================================================
-- EXTENSIONS
-- =====================================================

create extension if not exists "uuid-ossp";

-- =====================================================
-- PROFILES (linked to auth.users)
-- =====================================================

create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
before update on profiles
for each row
execute function update_updated_at();


-- =====================================================
-- BEHAVIOR PROFILES
-- =====================================================

create table if not exists behavior_profiles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid unique references auth.users(id) on delete cascade,
    behavior_model jsonb not null,
    mbti text not null,
    selected_interests jsonb,
    hobbies jsonb,
    diseases jsonb,
    constraints jsonb,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create trigger behavior_profiles_updated_at
before update on behavior_profiles
for each row
execute function update_updated_at();

create index if not exists idx_behavior_user
on behavior_profiles(user_id);


-- =====================================================
-- ENVIRONMENTAL READINGS (Historical Storage)
-- =====================================================

create table if not exists environmental_readings (
    id uuid primary key default uuid_generate_v4(),
    location jsonb not null,
    data_type text not null,
    readings jsonb not null,
    source text,
    recorded_at timestamp with time zone not null,
    is_forecast boolean default false,
    created_at timestamp with time zone default now()
);

create index if not exists idx_env_recorded_at
on environmental_readings(recorded_at);

create index if not exists idx_env_type
on environmental_readings(data_type);


-- =====================================================
-- USER ENVIRONMENT SESSIONS (Exposure Snapshots)
-- =====================================================

create table if not exists user_environment_sessions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    session_id text,
    lat float,
    lon float,
    temperature float,
    humidity float,
    wind_speed float,
    pm2_5 float,
    pm10 float,
    ozone float,
    nitrogen_dioxide float,
    aqi float,
    recorded_at timestamp with time zone default now()
);

create index if not exists idx_user_env_user
on user_environment_sessions(user_id);

create index if not exists idx_user_env_time
on user_environment_sessions(recorded_at);


-- =====================================================
-- USER ACTIVITY LOGS (Behavior-Exposure Link)
-- =====================================================

create table if not exists user_activity_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    outdoor_minutes int,
    activity_intensity text check (activity_intensity in ('low','moderate','high')),
    recorded_at timestamp with time zone default now()
);

create index if not exists idx_activity_user
on user_activity_logs(user_id);

create index if not exists idx_activity_time
on user_activity_logs(recorded_at);


-- =====================================================
-- DIGITAL TWIN STATE (Core Twin Persistence)
-- =====================================================

create table if not exists digital_twin_state (
    user_id uuid primary key references auth.users(id) on delete cascade,
    current_risk float,
    risk_category text,
    risk_components jsonb,
    exposure_7d_avg_pm2_5 float,
    trend_slope float,
    projection_7d jsonb,
    mitigation_plan jsonb,
    last_activity jsonb,
    last_environment jsonb,
    updated_at timestamp with time zone default now()
);

create index if not exists idx_twin_updated
on digital_twin_state(updated_at);


-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

alter table profiles enable row level security;
alter table behavior_profiles enable row level security;
alter table user_environment_sessions enable row level security;
alter table user_activity_logs enable row level security;
alter table digital_twin_state enable row level security;

-- Users can only access their own records

create policy "Users can view own profile"
on profiles
for select using (auth.uid() = id);

create policy "Users can update own profile"
on profiles
for update using (auth.uid() = id);

create policy "Users can manage own behavior"
on behavior_profiles
for all using (auth.uid() = user_id);

create policy "Users can view own environment sessions"
on user_environment_sessions
for select using (auth.uid() = user_id);

create policy "Users can insert own environment sessions"
on user_environment_sessions
for insert with check (auth.uid() = user_id);

create policy "Users can manage own activity logs"
on user_activity_logs
for all using (auth.uid() = user_id);

create policy "Users can view own twin state"
on digital_twin_state
for select using (auth.uid() = user_id);

create policy "Users can update own twin state"
on digital_twin_state
for update using (auth.uid() = user_id);


-- =====================================================
-- AUTO PROFILE CREATION TRIGGER
-- =====================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();