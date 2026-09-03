-- FLUENTR — Supabase schema for SupabaseDataProvider (V2)
-- Safe to run more than once (IF NOT EXISTS / OR REPLACE / DROP POLICY IF
-- EXISTS throughout). Also safe against the pre-existing `profiles`/`couple`
-- tables an earlier session created on this project (id + data + updated_at,
-- RLS on, zero policies, no owner_id) — this adds owner_id and the policies
-- without touching any data already in `data`.
-- Mirrors the exact JSON shape LocalDataProvider already uses (flDefaultProfile /
-- flDefaultCouple in js/core/dataService.js) — the `data` column is that object.

create table if not exists public.profiles (
  id text primary key,                 -- 'guilherme' | 'rayssa' — matches FL_KNOWN_PROFILES
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists owner_id uuid references auth.users(id); -- null until claimed on first magic-link login

create table if not exists public.couple (
  id text primary key,                 -- always 'main'
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Pre-seed the two known profile rows and the single couple row. The app
-- never INSERTs from the client — only UPDATEs an existing row — so seeding
-- here is required.
insert into public.profiles (id, data) values
  ('guilherme', '{}'::jsonb),
  ('rayssa', '{}'::jsonb)
on conflict (id) do nothing;

insert into public.couple (id, data) values ('main', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.couple enable row level security;

-- A signed-in user counts as "in the couple" once they've claimed a profile
-- row (owner_id set to their auth.uid()). Until then they can't read or
-- write anything — claiming is the one exception, gated separately below.
create or replace function public.fl_is_couple_member()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles where owner_id = auth.uid()
  );
$$;

-- SELECT: any claimed couple member can read both profiles (needed for the
-- Couple League/Duels) and the shared couple row.
drop policy if exists "profiles_select_couple_members" on public.profiles;
create policy "profiles_select_couple_members" on public.profiles
  for select using (public.fl_is_couple_member());

drop policy if exists "couple_select_couple_members" on public.couple;
create policy "couple_select_couple_members" on public.couple
  for select using (public.fl_is_couple_member());

-- UPDATE: you can only ever write your own row. Two cases —
--  1) claiming: row is unclaimed (owner_id is null) and you're setting it to yourself
--  2) already yours: owner_id already equals your uid
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  using (owner_id is null or owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Shared couple state (streak, daily challenge, duels) is writable by any
-- claimed member of the couple, not just one owner.
drop policy if exists "couple_update_couple_members" on public.couple;
create policy "couple_update_couple_members" on public.couple
  for update using (public.fl_is_couple_member());

-- No INSERT/DELETE policies on either table — rows are fixed and pre-seeded
-- above, the client only ever UPDATEs.
