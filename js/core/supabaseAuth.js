/* FLUENTR — core/supabaseAuth.js
   Thin wrapper around supabase-js auth: email+password sign-in/sign-up,
   session state, and claiming one of the two known profile rows
   (guilherme/rayssa) on first login. Only meaningful when FL_CONFIG has
   real Supabase credentials — see core/config.js and core/supabaseDataProvider.js.
   Password auth (not magic-link) on purpose — the project's default email
   sending is rate-limited to a handful of emails/hour with no SMTP
   configured, which made magic links impractical for the two of you to
   test/use. Sign-up requires "Confirm email" turned OFF in the Supabase
   dashboard (Authentication → Providers → Email) — otherwise it still
   needs to send (and wait on) a confirmation email. */

const FluentrSupabaseAuth = (function () {
  let client = null;
  let claimedIdCache = undefined; // undefined = not checked yet, null = checked, unclaimed

  function isEnabled() {
    return !!(FL_CONFIG && FL_CONFIG.SUPABASE_URL && FL_CONFIG.SUPABASE_ANON_KEY && window.supabase);
  }

  function getClient() {
    if (!client) {
      client = window.supabase.createClient(FL_CONFIG.SUPABASE_URL, FL_CONFIG.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
    }
    return client;
  }

  async function getSession() {
    const { data } = await getClient().auth.getSession();
    return data.session || null;
  }

  async function signUpWithPassword(email, password) {
    const { data, error } = await getClient().auth.signUp({ email, password });
    if (error) throw error;
    if (!data.session) throw new Error('Account created, but email confirmation is still required — turn off "Confirm email" in Supabase (Authentication → Providers → Email) to skip it.');
    return data.session;
  }

  async function signInWithPassword(email, password) {
    const { data, error } = await getClient().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
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

  return { isEnabled, getClient, getSession, signUpWithPassword, signInWithPassword, signOut, getClaimedProfileId, getUnclaimedProfileIds, claimProfile };
})();
