/* FLUENTR — core/config.js
   Supabase project credentials for V2 cloud sync. The anon key is meant to
   be public (Supabase's security boundary is Row Level Security on the
   tables, not secrecy of this key) — safe to ship in a static client bundle.
   Clear SUPABASE_URL to fall back to LocalDataProvider (IndexedDB only),
   e.g. for local development without touching the shared couple data.

   V3 additions:
   - EDGE_FUNCTIONS_URL: base URL for the AI Edge Functions (supabase/functions/).
     Public by design — same trust model as the anon key; the real
     protection is server-side rate limiting (see _shared/rateLimit.ts).
   - VAPID_PUBLIC_KEY: the public half of the Web Push keypair. The private
     half is a Supabase secret (Edge Functions → Manage secrets), never here. */
const FL_CONFIG = {
  SUPABASE_URL: 'https://hangejzdsnkyinpumihr.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhhbmdlanpkc25reWlucHVtaWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzEyMzYsImV4cCI6MjEwMzk0NzIzNn0.s94emn3ZXWF9T2h9vzMxluFztyPJiqVI6MhxIpCuREo',
  EDGE_FUNCTIONS_URL: 'https://hangejzdsnkyinpumihr.supabase.co/functions/v1',
  VAPID_PUBLIC_KEY: 'BKPui8anDhmqzpSwsZx2DFDKDtoo7zZ86txQ11uEA7M0fZ9l0tU4YMi4Vmk5NTzxNI0HSWTiXqpI9TAoTs_j-AI'
};
