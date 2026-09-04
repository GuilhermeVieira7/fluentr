-- FLUENTR — Automatic daily backup schema (V3.1)
-- Run once, after ai_schema.sql / push_schema.sql.

create table if not exists public.backups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  data jsonb not null   -- { profiles: [{id, data}], couple: {data} } — same shape as exportAll()
);
alter table public.backups enable row level security;

-- Readable by anyone with the anon key — same trust model as every other
-- table here (see supabase/schema.sql's note on why: it's just the two of
-- you, protected by knowing the app's URL/key, not per-account auth).
-- Writes only ever come from backup-daily using the service_role key.
drop policy if exists "backups_public_select" on public.backups;
create policy "backups_public_select" on public.backups
  for select using (true);

create index if not exists backups_created_at_idx on public.backups (created_at desc);

-- Same pg_cron/pg_net extensions push_schema.sql already enabled — this
-- is a no-op if that file already ran, safe either order.
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Daily at 04:00 UTC (01:00 in Brazil) — quiet hours, unlikely to collide
-- with anyone mid-session. backup-daily is deployed with --no-verify-jwt,
-- same reasoning as send-daily-reminders — but see that file's comment:
-- a bare net.http_post with only Content-Type gets rejected outright
-- ("JWT issued at future"), so the anon key headers below aren't optional.
select cron.schedule(
  'fluentr-daily-backup',
  '0 4 * * *',
  $$
  select net.http_post(
    url := 'https://hangejzdsnkyinpumihr.supabase.co/functions/v1/backup-daily',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhhbmdlanpkc25reWlucHVtaWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzEyMzYsImV4cCI6MjEwMzk0NzIzNn0.s94emn3ZXWF9T2h9vzMxluFztyPJiqVI6MhxIpCuREo',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhhbmdlanpkc25reWlucHVtaWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzEyMzYsImV4cCI6MjEwMzk0NzIzNn0.s94emn3ZXWF9T2h9vzMxluFztyPJiqVI6MhxIpCuREo'
    ),
    body := '{}'::jsonb
  );
  $$
);
