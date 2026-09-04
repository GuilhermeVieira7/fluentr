// FLUENTR — immediate push to one profile's devices, called directly by
// the client (unlike send-daily-reminders/backup-daily, which are cron-only).
// POST { profileId, title, body } -> { sent, staleRemoved }
// Deployed with normal JWT verification ON (needs the anon key, same as
// every other client-callable function) — this one isn't --no-verify-jwt
// since a real client is the caller, not pg_cron.
import webpush from 'npm:web-push@3';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/rateLimit.ts';

webpush.setVapidDetails(
  'mailto:fluentr@example.com',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const { profileId, title, body } = await req.json();
    if (!profileId || !title) return jsonResponse({ error: 'Missing profileId or title' }, 400);
    if (typeof title !== 'string' || title.length > 120) return jsonResponse({ error: 'Title too long' }, 400);
    if (body && (typeof body !== 'string' || body.length > 250)) return jsonResponse({ error: 'Body too long' }, 400);

    const sb = serviceClient();
    const { data: subs, error } = await sb.from('push_subscriptions').select('*').eq('profile_id', profileId);
    if (error) return jsonResponse({ error: error.message }, 500);

    let sent = 0;
    const staleIds: string[] = [];
    const payload = JSON.stringify({ title, body: body || '' });
    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        sent++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) staleIds.push(sub.id);
      }
    }
    if (staleIds.length) await sb.from('push_subscriptions').delete().in('id', staleIds);

    return jsonResponse({ sent, staleRemoved: staleIds.length });
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
