// FLUENTR — daily streak-reminder push. Triggered by pg_cron (see
// supabase/push_schema.sql) once a day, not by the client. For every
// profile with an active streak that hasn't played today, sends a push
// to every device subscribed for that profile.
// Deploy this one with "Verify JWT" turned OFF (dashboard toggle) — see
// push_schema.sql for why that's an acceptable tradeoff here.
import webpush from 'npm:web-push@3';
import { serviceClient } from '../_shared/rateLimit.ts';

webpush.setVapidDetails(
  'mailto:fluentr@example.com',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

Deno.serve(async (_req) => {
  const sb = serviceClient();
  const { data: profiles, error } = await sb.from('profiles').select('id, data');
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const today = todayISO();
  const dueProfileIds: string[] = [];
  for (const row of profiles ?? []) {
    const p = row.data as { streak?: { current?: number; lastActiveDate?: string } };
    const streak = p.streak?.current ?? 0;
    const lastActive = p.streak?.lastActiveDate;
    if (streak > 0 && lastActive !== today) dueProfileIds.push(row.id);
  }
  if (!dueProfileIds.length) return new Response(JSON.stringify({ sent: 0, reason: 'nobody at risk today' }));

  const { data: subs } = await sb.from('push_subscriptions').select('*').in('profile_id', dueProfileIds);
  let sent = 0;
  const staleIds: string[] = [];
  for (const sub of subs ?? []) {
    const p = (profiles ?? []).find((r) => r.id === sub.profile_id);
    const streakLen = (p?.data as { streak?: { current?: number } })?.streak?.current ?? 0;
    const payload = JSON.stringify({
      title: `Don't lose your ${streakLen}-day streak 🔥`,
      body: 'One quick lesson keeps it alive today.',
    });
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
      );
      sent++;
    } catch (e) {
      // 404/410 = the browser unsubscribed or the subscription expired —
      // stop trying it. Any other error we just skip for today.
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) staleIds.push(sub.id);
    }
  }
  if (staleIds.length) await sb.from('push_subscriptions').delete().in('id', staleIds);

  return new Response(JSON.stringify({ sent, staleRemoved: staleIds.length }));
});
