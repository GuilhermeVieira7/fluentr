/* FLUENTR — core/supabaseAuth.js
   Thin wrapper around supabase-js auth: magic-link sign-in, session state,
   and claiming one of the two known profile rows (guilherme/rayssa) on
   first login. Only meaningful when FL_CONFIG has real Supabase credentials
   — see core/config.js and core/supabaseDataProvider.js. */

const FluentrSupabaseAuth = (function () {
  let client = null;
  let claimedIdCache = undefined; // undefined = not checked yet, null = checked, unclaimed

  function isEnabled() {
    return !!(FL_CONFIG && FL_CONFIG.SUPABASE_URL && FL_CONFIG.SUPABASE_ANON_KEY && window.supabase);
  }

  function getClient() {
    if (!client) {
      client = window.supabase.createClient(FL_CONFIG.SUPABASE_URL, FL_CONFIG.SUPABASE_ANON_KEY, {
        auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    }
    return client;
  }

  // Magic-link redirects land back on this same page with a `?code=...`
  // query param (PKCE flow) — supabase-js consumes it automatically on
  // client creation via detectSessionInUrl. Strip it afterward so a reload
  // doesn't carry a stale/used code around.
  function cleanUrlAfterAuth() {
    if (window.location.search.includes('code=')) {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, document.title, url.toString());
    }
  }

  async function getSession() {
    const { data } = await getClient().auth.getSession();
    return data.session || null;
  }

  async function sendMagicLink(email) {
    const redirectTo = window.location.origin + window.location.pathname;
    const { error } = await getClient().auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    if (error) throw error;
  }

  async function signOut() {
    claimedIdCache = undefined;
    await getClient().auth.signOut();
  }

  // Which of the two known profile rows (if any) the signed-in user has
  // already claimed. Cached for the session — claiming is a one-time action.
  async function getClaimedProfileId() {
    if (claimedIdCache !== undefined) return claimedIdCache;
    const session = await getSession();
    if (!session) { claimedIdCache = null; return null; }
    const { data, error } = await getClient().from('profiles').select('id').eq('owner_id', session.user.id).maybeSingle();
    if (error) { claimedIdCache = null; return null; }
    claimedIdCache = data ? data.id : null;
    return claimedIdCache;
  }

  // Which known profile ids are still unclaimed — drives the "which of you
  // is this?" picker after first login.
  async function getUnclaimedProfileIds() {
    const { data, error } = await getClient().from('profiles').select('id, owner_id');
    if (error || !data) return FL_KNOWN_PROFILES.map((p) => p.id);
    return data.filter((r) => !r.owner_id).map((r) => r.id);
  }

  // Returns true if claimed successfully, false if someone else claimed it
  // first (race between the two of you both onboarding at once).
  async function claimProfile(id) {
    const session = await getSession();
    if (!session) return false;
    const { data, error } = await getClient().from('profiles')
      .update({ owner_id: session.user.id })
      .eq('id', id).is('owner_id', null)
      .select('id');
    if (error) throw error;
    const claimed = !!(data && data.length);
    if (claimed) claimedIdCache = id;
    return claimed;
  }

  return { isEnabled, getClient, cleanUrlAfterAuth, getSession, sendMagicLink, signOut, getClaimedProfileId, getUnclaimedProfileIds, claimProfile };
})();
