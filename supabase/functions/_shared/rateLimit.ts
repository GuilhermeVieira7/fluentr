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
// Delegates to the increment_ai_usage() Postgres function (ai_schema.sql)
// so the check-and-increment is one atomic statement — a separate
// SELECT-then-UPSERT here would leave a race window where two concurrent
// requests could both pass the check before either write landed.
export async function checkAndConsume(profileId: string): Promise<{ allowed: boolean; remaining: number }> {
  const sb = serviceClient();
  const { data, error } = await sb.rpc('increment_ai_usage', { p_profile_id: profileId, p_limit: DAILY_LIMIT });
  if (error) throw error;
  if (data === null) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining: DAILY_LIMIT - data };
}
