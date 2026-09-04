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

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Schedules the reminder function daily at 19:00 UTC (edit the cron
-- string for your timezone — this project's users are in Brazil, UTC-3,
-- so 19:00 UTC is 16:00 local; pick whatever hour actually makes sense
-- for a "don't lose your streak" nudge and adjust).
--
-- send-daily-reminders is deployed with --no-verify-jwt so it doesn't
-- need a real user session — but Supabase's edge gateway still rejects a
-- request with literally no apikey/Authorization at all (confirmed: a
-- bare net.http_post with only Content-Type gets "JWT issued at future"
-- back, meaning this cron job would have silently never actually run).
-- The anon key below is the same public key already shipped in
-- js/core/config.js — safe to embed here for the same reason it's safe
-- there (RLS is the security boundary, not secrecy of this key).
select cron.schedule(
  'fluentr-daily-reminders',
  '0 19 * * *',
  $$
  select net.http_post(
    url := 'https://hangejzdsnkyinpumihr.supabase.co/functions/v1/send-daily-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhhbmdlanpkc25reWlucHVtaWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzEyMzYsImV4cCI6MjEwMzk0NzIzNn0.s94emn3ZXWF9T2h9vzMxluFztyPJiqVI6MhxIpCuREo',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhhbmdlanpkc25reWlucHVtaWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzEyMzYsImV4cCI6MjEwMzk0NzIzNn0.s94emn3ZXWF9T2h9vzMxluFztyPJiqVI6MhxIpCuREo'
    ),
    body := '{}'::jsonb
  );
  $$
);
