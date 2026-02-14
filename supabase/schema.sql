-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES: Extends Supabase Auth
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  bio text,
  preferences jsonb default '{}'::jsonb, -- distinct from settings, e.g. ui theme
  settings jsonb default '{}'::jsonb, -- privacy, risk tolerance
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- DIGITAL TWINS: 1-to-1 with Profiles
create table if not exists public.digital_twins (
  id uuid references public.profiles(id) on delete cascade primary key,
  health_metrics jsonb default '{}'::jsonb,
  avatar_state jsonb default '{}'::jsonb,
  last_synced_at timestamptz default now()
);

-- SIMULATIONS
create table if not exists public.simulations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  parameters jsonb default '{}'::jsonb,
  results jsonb default '{}'::jsonb,
  executed_at timestamptz default now()
);

-- ENVIRONMENTAL READINGS
create table if not exists public.environmental_readings (
  id uuid default uuid_generate_v4() primary key,
  location jsonb, -- {lat: ..., long: ..., name: ...}
  data_type text not null, -- 'air_quality', 'temperature', 'humidity'
  readings jsonb not null, -- {value: 123, unit: 'AQI'}
  source text,
  recorded_at timestamptz default now()
);

-- CHAT SESSIONS
create table if not exists public.chat_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CHAT MESSAGES
create table if not exists public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  role text not null, -- 'user', 'assistant' or 'system'
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- USER ACTIVITIES (Growth/Leaderboard)
create table if not exists public.user_activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  activity_type text not null,
  points_earned int default 0,
  metadata jsonb default '{}'::jsonb,
  completed_at timestamptz default now()
);

-- RLS POLICIES
alter table public.profiles enable row level security;
alter table public.digital_twins enable row level security;
alter table public.simulations enable row level security;
alter table public.environmental_readings enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.user_activities enable row level security;

-- Profiles: Users can view/edit their own
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Digital Twins: Users can view/edit their own
create policy "Users can view own twin" on public.digital_twins for select using (auth.uid() = id);
create policy "Users can update own twin" on public.digital_twins for update using (auth.uid() = id);

-- Simulations: Users can view/create their own
create policy "Users can view own simulations" on public.simulations for select using (auth.uid() = user_id);
create policy "Users can create own simulations" on public.simulations for insert with check (auth.uid() = user_id);

-- Chat: Users can view/create their own sessions and messages
create policy "Users can view own chat sessions" on public.chat_sessions for select using (auth.uid() = user_id);
create policy "Users can create own chat sessions" on public.chat_sessions for insert with check (auth.uid() = user_id);
create policy "Users can view own chat messages" on public.chat_messages for select using (
  exists (select 1 from public.chat_sessions s where s.id = session_id and s.user_id = auth.uid())
);
create policy "Users can create own chat messages" on public.chat_messages for insert with check (
  exists (select 1 from public.chat_sessions s where s.id = session_id and s.user_id = auth.uid())
);

-- Environmental Readings: Public read, service role write (simplified)s
create policy "Public read environmental data" on public.environmental_readings for select using (true);

-- User Activities: Users can view own
create policy "Users can view own activities" on public.user_activities for select using (auth.uid() = user_id);

-- FUNCTIONS & TRIGGERS
-- Handle new user creation automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  insert into public.digital_twins (id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
