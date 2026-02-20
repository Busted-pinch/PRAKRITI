-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- =========================
-- PROFILES
-- =========================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  bio text,
  preferences jsonb default '{}'::jsonb,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- DIGITAL TWINS
-- =========================
create table if not exists public.digital_twins (
  id uuid references public.profiles(id) on delete cascade primary key,
  health_metrics jsonb default '{}'::jsonb,
  avatar_state jsonb default '{}'::jsonb,
  last_synced_at timestamptz default now()
);

-- =========================
-- SIMULATIONS
-- =========================
create table if not exists public.simulations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  parameters jsonb default '{}'::jsonb,
  results jsonb default '{}'::jsonb,
  executed_at timestamptz default now()
);

-- =========================
-- ENVIRONMENTAL READINGS
-- =========================
create table if not exists public.environmental_readings (
  id uuid default uuid_generate_v4() primary key,
  location jsonb,
  data_type text not null,
  readings jsonb not null,
  source text,
  recorded_at timestamptz default now(),
  is_forecast boolean default false
);

-- =========================
-- INDEXES (FIXED + OPTIMIZED)
-- =========================

create index if not exists idx_env_data_type
on public.environmental_readings (data_type);

create index if not exists idx_env_recorded_at
on public.environmental_readings (recorded_at);

create index if not exists idx_env_lat
on public.environmental_readings ((location->>'lat'));

-- 🔥 FIXED (was "long")
create index if not exists idx_env_lon
on public.environmental_readings ((location->>'lon'));

create index if not exists idx_env_value
on public.environmental_readings ((readings->>'value'));

create index if not exists idx_env_forecast
on public.environmental_readings (is_forecast);

-- 🔥 WAQI DUPLICATE PROTECTION
create unique index if not exists unique_waqi_snapshot
on public.environmental_readings (data_type, recorded_at, source);

-- =========================
-- CHAT SESSIONS
-- =========================
create table if not exists public.chat_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- CHAT MESSAGES
-- =========================
create table if not exists public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  role text not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- =========================
-- USER ACTIVITIES
-- =========================
create table if not exists public.user_activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  activity_type text not null,
  points_earned int default 0,
  metadata jsonb default '{}'::jsonb,
  completed_at timestamptz default now()
);

-- =========================
-- ENABLE RLS
-- =========================
alter table public.profiles enable row level security;
alter table public.digital_twins enable row level security;
alter table public.simulations enable row level security;
alter table public.environmental_readings enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.user_activities enable row level security;

-- =========================
-- RLS POLICIES
-- =========================

create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

create policy "Users can view own twin"
on public.digital_twins for select
using (auth.uid() = id);

create policy "Users can update own twin"
on public.digital_twins for update
using (auth.uid() = id);

create policy "Users can view own simulations"
on public.simulations for select
using (auth.uid() = user_id);

create policy "Users can create own simulations"
on public.simulations for insert
with check (auth.uid() = user_id);

create policy "Users can view own chat sessions"
on public.chat_sessions for select
using (auth.uid() = user_id);

create policy "Users can create own chat sessions"
on public.chat_sessions for insert
with check (auth.uid() = user_id);

create policy "Users can view own chat messages"
on public.chat_messages for select
using (
  exists (
    select 1 from public.chat_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
);

create policy "Users can create own chat messages"
on public.chat_messages for insert
with check (
  exists (
    select 1 from public.chat_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
);

create policy "Public read environmental data"
on public.environmental_readings for select
using (true);

create policy "Users can view own activities"
on public.user_activities for select
using (auth.uid() = user_id);

-- =========================
-- AUTO CREATE PROFILE + DIGITAL TWIN
-- =========================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );

  insert into public.digital_twins (id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
