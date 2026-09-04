// FLUENTR — automatic daily backup. Triggered by pg_cron (see
// supabase/backup_schema.sql), not by the client. Snapshots both profiles
// and the couple row into public.backups, then prunes down to the most
// recent KEEP_COUNT snapshots so the table doesn't grow forever.
// Deploy with --no-verify-jwt — same reasoning as send-daily-reminders.
import { serviceClient } from '../_shared/rateLimit.ts';

const KEEP_COUNT = 14; // ~2 weeks of daily snapshots

Deno.serve(async (_req) => {
  const sb = serviceClient();

  const [{ data: profiles, error: pErr }, { data: couple, error: cErr }] = await Promise.all([
    sb.from('profiles').select('id, data'),
    sb.from('couple').select('data').eq('id', 'main').maybeSingle(),
  ]);
  if (pErr) return new Response(JSON.stringify({ error: pErr.message }), { status: 500 });
  if (cErr) return new Response(JSON.stringify({ error: cErr.message }), { status: 500 });

  const snapshot = { profiles: profiles ?? [], couple: couple?.data ?? null };
  const { error: insertErr } = await sb.from('backups').insert({ data: snapshot });
  if (insertErr) return new Response(JSON.stringify({ error: insertErr.message }), { status: 500 });

  // Prune: keep the KEEP_COUNT most recent rows, delete the rest.
  const { data: old } = await sb
    .from('backups')
    .select('id')
    .order('created_at', { ascending: false })
    .range(KEEP_COUNT, 9999);
  if (old && old.length) {
    await sb.from('backups').delete().in('id', old.map((r) => r.id));
  }

  return new Response(JSON.stringify({ backed_up: true, pruned: old?.length ?? 0 }));
});
