/* FLUENTR — core/supabaseDataProvider.js
   Implements the exact same interface as LocalDataProvider (core/dataService.js)
   against the Supabase tables in supabase/schema.sql. RLS scopes writes to
   auth.uid() — see that file — so this never needs to check ownership itself;
   a write to a row you don't own just affects zero rows and we surface that.
   Requires a signed-in session (see supabaseAuth.js); app.js only reaches
   this provider's methods after the auth/claim gates have passed. */

const SupabaseDataProvider = (function () {

  function sb() { return FluentrSupabaseAuth.getClient(); }

  function rowToProfile(row) {
    if (!row) return null;
    return flMigrateProfile(Object.assign({}, row.data, { id: row.id }));
  }
  function rowToCouple(row) {
    if (!row) return null;
    return flMigrateCouple(Object.assign({}, row.data, { id: row.id }));
  }

  return {
    async listProfiles() {
      const { data, error } = await sb().from('profiles').select('id, data');
      if (error) throw error;
      return data.map(rowToProfile);
    },

    async getProfile(id) {
      const { data, error } = await sb().from('profiles').select('id, data').eq('id', id).maybeSingle();
      if (error) throw error;
      return rowToProfile(data);
    },

    // Rows are pre-seeded by supabase/schema.sql for both known profiles —
    // this never needs to INSERT (no INSERT policy exists for clients).
    async ensureProfile(id) {
      const existing = await this.getProfile(id);
      if (existing) return existing;
      const known = FL_KNOWN_PROFILES.find((k) => k.id === id);
      return flDefaultProfile(id, known ? known.name : id, known ? known.color : '#5b3df5');
    },

    async saveProfile(profile) {
      const { error } = await sb().from('profiles').update({ data: profile, updated_at: new Date().toISOString() }).eq('id', profile.id);
      if (error) throw error;
      return profile;
    },

    async updateProfile(id, mutator) {
      const p = await this.ensureProfile(id);
      mutator(p);
      await this.saveProfile(p);
      return p;
    },

    async getCouple() {
      const { data, error } = await sb().from('couple').select('id, data').eq('id', 'main').maybeSingle();
      if (error) throw error;
      return rowToCouple(data) || flDefaultCouple();
    },

    async updateCouple(mutator) {
      const c = await this.getCouple();
      mutator(c);
      const { error } = await sb().from('couple').update({ data: c, updated_at: new Date().toISOString() }).eq('id', 'main');
      if (error) throw error;
      return c;
    },

    // Device-local convenience only (which claimed profile this browser is
    // currently viewing) — not user data, so it stays in localStorage same
    // as LocalDataProvider. Real access control is the Supabase session.
    getActiveProfileId() {
      try { return window.localStorage.getItem('fluentr_active_profile'); } catch (e) { return null; }
    },
    setActiveProfileId(id) {
      try { window.localStorage.setItem('fluentr_active_profile', id); } catch (e) { /* ignore */ }
    },

    getTheme() {
      try { return window.localStorage.getItem('fluentr_theme') || 'dark'; } catch (e) { return 'dark'; }
    },
    setTheme(theme) {
      try { window.localStorage.setItem('fluentr_theme', theme); } catch (e) { /* ignore */ }
    },

    async exportAll() {
      const profiles = await this.listProfiles();
      const couple = await this.getCouple();
      return JSON.stringify({ exportedAt: new Date().toISOString(), profiles, couple }, null, 2);
    },

    // RLS means this can only ever actually write the profile(s) you own —
    // importing a backup that includes your partner's profile silently
    // no-ops on their row rather than failing the whole import.
    async importAll(jsonString) {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.profiles)) {
        for (const p of data.profiles) { try { await this.saveProfile(p); } catch (e) { /* not yours to write */ } }
      }
      if (data.couple) { try { await this.updateCouple((c) => Object.assign(c, data.couple)); } catch (e) { /* ignore */ } }
      return true;
    },

    async resetProfile(id) {
      const known = FL_KNOWN_PROFILES.find((k) => k.id === id);
      const fresh = flDefaultProfile(id, known ? known.name : id, known ? known.color : '#5b3df5');
      await this.saveProfile(fresh);
      return fresh;
    },

    // Can only ever reset the caller's own claimed profile — RLS has no
    // notion of "all data" here, unlike LocalDataProvider's single device.
    async resetAll() {
      const myId = await FluentrSupabaseAuth.getClaimedProfileId();
      if (!myId) return;
      await this.resetProfile(myId);
    }
  };
})();
