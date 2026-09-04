-- FLUENTR — AI features schema (V3)
-- Run once in the Supabase SQL Editor, after supabase/schema.sql.
-- Two tables, both written ONLY by Edge Functions using the service_role
-- key (never by the client directly) — RLS denies all client access, which
-- is exactly what we want: rate limits and cached generations must not be
-- readable/writable by anyone holding just the anon key, or a client could
-- forge its own "under the limit" state or poison the shared cache.

-- One row per profile per UTC day. Edge Functions increment `count` before
-- calling Gemini and reject the request if it's already at the daily cap —
-- the cap lives in the Edge Function code (see supabase/functions/_shared),
-- not here; this table is just the counter.
create table if not exists public.ai_usage (
  profile_id text not null,
  usage_date date not null default (now() at time zone 'utc')::date,
  count integer not null default 0,
  primary key (profile_id, usage_date)
);
alter table public.ai_usage enable row level security;
-- No policies at all = no client access (client never touches this table
-- directly; the anon/authenticated roles get zero grants here on purpose).

-- Atomic check-and-increment. The Edge Function used to do a separate
-- SELECT then UPSERT — two round trips with a window between them where
-- two concurrent requests could both read "under the cap" before either
-- write landed, letting the daily limit be exceeded (and undercounted,
-- since the second UPSERT would overwrite rather than add to the first).
-- A single INSERT ... ON CONFLICT DO UPDATE ... WHERE, in one statement,
-- closes that window: Postgres serializes concurrent upserts to the same
-- row, so only one can win the race for the last slot under the cap.
-- Returns the new count if the call was allowed, or null if the profile
-- was already at/over p_limit for today.
create or replace function public.increment_ai_usage(p_profile_id text, p_limit integer)
returns integer
language plpgsql
security definer
as $$
declare
  v_count integer;
begin
  insert into public.ai_usage (profile_id, usage_date, count)
  values (p_profile_id, (now() at time zone 'utc')::date, 1)
  on conflict (profile_id, usage_date) do update
    set count = public.ai_usage.count + 1
    where public.ai_usage.count < p_limit
  returning count into v_count;
  return v_count;
end;
$$;

-- Cache of AI-generated practice exercises, keyed by topic so a second
-- request for the same weak spot (by either partner) can reuse a prior
-- generation instead of paying for a fresh Gemini call every time.
create table if not exists public.generated_exercises (
  id text primary key,               -- 'gen-<uuid>'
  topic text not null,               -- e.g. 'meetings-disagreeing', matches lessonEngine's weak-topic tags
  level text,                        -- CEFR level this was generated for
  data jsonb not null,               -- same shape as a data/lessons.js entry (question/options/answer/explanation/pt)
  created_at timestamptz not null default now(),
  used_count integer not null default 0
);
alter table public.generated_exercises enable row level security;

-- Unlike ai_usage, the CLIENT does read this table (to pull cached
-- exercises into a session) — but only ever reads. All writes (new
-- generations) go through the Edge Function with the service_role key.
drop policy if exists "generated_exercises_public_select" on public.generated_exercises;
create policy "generated_exercises_public_select" on public.generated_exercises
  for select using (true);

create index if not exists generated_exercises_topic_idx on public.generated_exercises (topic);
