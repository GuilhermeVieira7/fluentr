/* FLUENTR — core/supabaseAuth.js
   Just the Supabase client — no accounts. It's just the two of you, so
   access control is "you have the app's URL," same trust model as the
   free profile picker LocalDataProvider already used; the anon key is
   meant to be public regardless (RLS, not key secrecy, is Supabase's real
   security boundary — see supabase/schema.sql for why these policies are
   deliberately open). Only meaningful when FL_CONFIG has real credentials
   — see core/config.js and core/supabaseDataProvider.js. */

const FluentrSupabaseAuth = (function () {
  let client = null;

  function isEnabled() {
    return !!(FL_CONFIG && FL_CONFIG.SUPABASE_URL && FL_CONFIG.SUPABASE_ANON_KEY && window.supabase);
  }

  function getClient() {
    if (!client) {
      client = window.supabase.createClient(FL_CONFIG.SUPABASE_URL, FL_CONFIG.SUPABASE_ANON_KEY);
    }
    return client;
  }

  return { isEnabled, getClient };
})();
