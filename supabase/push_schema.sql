-- FLUENTR — Push notifications schema (V3)
-- Run once, after ai_schema.sql.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;

-- The client writes its OWN subscription (this device registering to get
-- notified) but never reads anyone's — reading subscription endpoints
-- would let any client enumerate exactly where to forge push traffic.
-- Only the send-daily-reminders Edge Function (service_role, bypasses
-- RLS) ever reads this table.
drop policy if exists "push_subscriptions_insert" on public.push_subscriptions;
create policy "push_subscriptions_insert" on public.push_subscriptions
  for insert with check (true);
drop policy if exists "push_subscriptions_delete_own" on public.push_subscriptions;
create policy "push_subscriptions_delete_own" on public.push_subscriptions
  for delete using (true);

-- Schedules the reminder function daily at 19:00 UTC (edit the cron
-- string for your timezone — this project's users are in Brazil, UTC-3,
-- so 19:00 UTC is 16:00 local; pick whatever hour actually makes sense
-- for a "don't lose your streak" nudge and adjust).
-- Requires the pg_cron and pg_net extensions (Database → Extensions —
-- both are available by default on Supabase, just need enabling if off).
--
-- send-daily-reminders is deployed with --no-verify-jwt, specifically so
-- this call needs no key at all — it accepts no meaningful input and only
-- ever reads its own database, so an unauthenticated trigger is an
-- acceptable, much simpler tradeoff than threading a service-role key
-- through a cron job definition.
select cron.schedule(
  'fluentr-daily-reminders',
  '0 19 * * *',
  $$
  select net.http_post(
    url := 'https://hangejzdsnkyinpumihr.supabase.co/functions/v1/send-daily-reminders',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
