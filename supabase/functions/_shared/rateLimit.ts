// FLUENTR — per-profile daily rate limit, enforced server-side.
// Checked/incremented against public.ai_usage using the service_role key
// (SUPABASE_SERVICE_ROLE_KEY is auto-injected into every Edge Function's
// env — never something we set ourselves). That table has zero RLS
// policies, so this is the ONLY way it's ever touched: a client can't
// read its own count, forge it, or reset it by calling the table directly.
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Generous for two people's daily practice, tight enough that a runaway
// client-side loop (a bug, not malice — there's no auth to make malice
// worth it) can't run up a surprise bill overnight.
const DAILY_LIMIT = 60;

export function serviceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

// Returns { allowed: true, remaining } or { allowed: false, remaining: 0 }.
// Increments the counter as part of the same check — callers should only
// proceed to the (costly) Gemini call when allowed is true.
export async function checkAndConsume(profileId: string): Promise<{ allowed: boolean; remaining: number }> {
  const sb = serviceClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await sb
    .from('ai_usage')
    .select('count')
    .eq('profile_id', profileId)
    .eq('usage_date', today)
    .maybeSingle();

  const current = existing?.count ?? 0;
  if (current >= DAILY_LIMIT) return { allowed: false, remaining: 0 };

  await sb.from('ai_usage').upsert(
    { profile_id: profileId, usage_date: today, count: current + 1 },
    { onConflict: 'profile_id,usage_date' },
  );
  return { allowed: true, remaining: DAILY_LIMIT - current - 1 };
}
