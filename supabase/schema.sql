-- FLUENTR — Supabase schema for SupabaseDataProvider (V2)
-- Safe to run more than once (IF NOT EXISTS / OR REPLACE / DROP POLICY IF
-- EXISTS throughout).
-- Mirrors the exact JSON shape LocalDataProvider already uses (flDefaultProfile /
-- flDefaultCouple in js/core/dataService.js) — the `data` column is that object.
--
-- No real accounts: it's just the two of you, so access control is "you
-- have the app's URL and the anon key" (the anon key is meant to be public
-- regardless — this is the same trust model the original free profile
-- picker used, just backed by shared Postgres instead of per-device
-- IndexedDB). If you ever want per-person auth back, that needs RLS scoped
-- to auth.uid() — see git history for a prior attempt and why it's trickier
-- than it looks (STABLE functions in a SELECT policy don't see a row an
-- UPDATE in the very same statement just wrote, which broke first-time
-- profile claiming in a way that took a while to track down).

create table if not exists public.profiles (
  id text primary key,                 -- 'guilherme' | 'rayssa' — matches FL_KNOWN_PROFILES
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

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

-- Clean up policies/columns/functions from an earlier per-account design.
drop policy if exists "profiles_select_couple_members" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "couple_select_couple_members" on public.couple;
drop policy if exists "couple_update_couple_members" on public.couple;
drop function if exists public.fl_is_couple_member();
alter table public.profiles drop column if exists owner_id;

-- Open read/write to anyone with the anon key (see note above on why).
drop policy if exists "profiles_public_select" on public.profiles;
create policy "profiles_public_select" on public.profiles for select using (true);
drop policy if exists "profiles_public_update" on public.profiles;
create policy "profiles_public_update" on public.profiles for update using (true) with check (true);

drop policy if exists "couple_public_select" on public.couple;
create policy "couple_public_select" on public.couple for select using (true);
drop policy if exists "couple_public_update" on public.couple;
create policy "couple_public_update" on public.couple for update using (true) with check (true);

-- No INSERT/DELETE policies on either table — rows are fixed and pre-seeded
-- above, the client only ever UPDATEs.

-- Live updates: puts both tables in the realtime publication so the other
-- partner's device is pushed UPDATE events (see subscribeToChanges in
-- js/core/supabaseDataProvider.js) instead of needing a manual reload to
-- see new XP / a completed daily challenge / a finished duel.
-- `add table` errors if the table is already in the publication, so each is
-- guarded rather than run bare.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'couple'
  ) then
    alter publication supabase_realtime add table public.couple;
  end if;
end $$;
