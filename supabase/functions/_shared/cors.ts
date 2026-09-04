// FLUENTR — shared CORS headers for all Edge Functions.
// The app has no accounts, so "authorized caller" just means "holds the
// anon key" — same trust model as the database's own open RLS policies
// (see supabase/schema.sql). CORS here is about browser-enforced origin
// checks, not an additional security boundary; the real protections are
// the anon-key requirement (Supabase's default JWT check on functions)
// and the per-profile rate limit each function applies itself.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function handleOptions(req: Request): Response | null {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  return null;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
