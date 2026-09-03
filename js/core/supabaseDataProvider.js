/* FLUENTR — core/supabaseDataProvider.js
   Implements the exact same interface as LocalDataProvider (core/dataService.js)
   against the Supabase tables in supabase/schema.sql. No accounts — both
   profiles/couple rows are readable and writable by anyone with the anon
   key (see that file for why). app.js's boot/gate flow doesn't need to
   know or care which provider is active. */

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

    // Rows are pre-seeded by supabase/schema.sql for both known profiles,
    // but with an empty `data: {}` — so the row always exists, but is only
    // really "created" once it has a name. (LocalDataProvider's equivalent
    // check is simpler — !p — because there a missing row IS the signal;
    // here the row is never missing, just possibly still empty.) On an
    // empty row this builds the real defaults and writes them back, same
    // self-healing LocalDataProvider does for a first-ever profile.
    async ensureProfile(id) {
      const existing = await this.getProfile(id);
      if (existing && existing.name) return existing;
      const known = FL_KNOWN_PROFILES.find((k) => k.id === id);
      const fresh = flDefaultProfile(id, known ? known.name : id, known ? known.color : '#5b3df5');
      await this.saveProfile(fresh);
      return fresh;
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
    // Which profile this browser is currently viewing — same free-pick
    // model as LocalDataProvider, just against shared cloud data instead
    // of a local IndexedDB.
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

    async importAll(jsonString) {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.profiles)) {
        for (const p of data.profiles) await this.saveProfile(p);
      }
      if (data.couple) await this.updateCouple((c) => Object.assign(c, data.couple));
      return true;
    },

    async resetProfile(id) {
      const known = FL_KNOWN_PROFILES.find((k) => k.id === id);
      const fresh = flDefaultProfile(id, known ? known.name : id, known ? known.color : '#5b3df5');
      await this.saveProfile(fresh);
      return fresh;
    },

    // Resets both profiles and the shared couple row — there's no
    // per-account scoping to limit this to "just mine" any more.
    async resetAll() {
      for (const k of FL_KNOWN_PROFILES) await this.resetProfile(k.id);
      await this.updateCouple((c) => Object.assign(c, flDefaultCouple(), { id: 'main' }));
    }
  };
})();
