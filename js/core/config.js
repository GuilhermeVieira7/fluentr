/* FLUENTR — core/config.js
   Supabase project credentials for V2 cloud sync. The anon key is meant to
   be public (Supabase's security boundary is Row Level Security on the
   tables, not secrecy of this key) — safe to ship in a static client bundle.
   Clear SUPABASE_URL to fall back to LocalDataProvider (IndexedDB only),
   e.g. for local development without touching the shared couple data. */
const FL_CONFIG = {
  SUPABASE_URL: 'https://hangejzdsnkyinpumihr.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhhbmdlanpkc25reWlucHVtaWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzEyMzYsImV4cCI6MjEwMzk0NzIzNn0.s94emn3ZXWF9T2h9vzMxluFztyPJiqVI6MhxIpCuREo'
};
