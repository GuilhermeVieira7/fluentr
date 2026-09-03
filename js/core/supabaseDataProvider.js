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

    // Plain last-write-wins — fine for saveProfile since each person is
    // nearly always the only writer of their own row. updateProfile below
    // uses the CAS-with-retry version instead, because its one real
    // cross-device writer (a Duel's loser/winner update, which can target
    // either partner's profile from whichever device finalized the duel)
    // needs it. See updateCouple for why a shared row can't get away with this.
    async saveProfile(profile) {
      const { data, error } = await sb().from('profiles').update({ data: profile, updated_at: new Date().toISOString() }).eq('id', profile.id).select('id');
      if (error) throw error;
      if (!data || !data.length) throw new Error(`saveProfile: no row for id "${profile.id}" (not one of the pre-seeded profiles)`);
      return profile;
    },

    // Optimistic concurrency: read the row's current updated_at, mutate,
    // then write conditioned on that same updated_at still being current.
    // If another writer beat us to it, the conditional UPDATE matches zero
    // rows (not an error) — re-read the now-current row and retry the
    // mutator against it, instead of blindly overwriting whatever they
    // just wrote (which is what a plain read-then-write does, and why the
    // Daily Couple Challenge could lose a partner's completion — see git
    // history / supabase/schema.sql's note on this).
    async updateProfile(id, mutator) {
      for (let attempt = 0; attempt < 8; attempt++) {
        const { data: row, error: readErr } = await sb().from('profiles').select('id, data, updated_at').eq('id', id).maybeSingle();
        if (readErr) throw readErr;
        // Rows are always pre-seeded (schema.sql) — a missing row would
        // mean the id isn't one of the known profiles at all.
        if (!row) throw new Error(`updateProfile: no row for id "${id}"`);
        const p = rowToProfile(row);
        mutator(p);
        const { data: written, error } = await sb().from('profiles')
          .update({ data: p, updated_at: new Date().toISOString() })
          .eq('id', id).eq('updated_at', row.updated_at)
          .select('id');
        if (error) throw error;
        if (written && written.length) return p;
      }
      throw new Error(`updateProfile: too many concurrent write conflicts for "${id}"`);
    },

    async getCouple() {
      const { data, error } = await sb().from('couple').select('id, data').eq('id', 'main').maybeSingle();
      if (error) throw error;
      return rowToCouple(data) || flDefaultCouple();
    },

    // Same optimistic-concurrency retry as updateProfile, and much more
    // load-bearing here: the couple row is the one place both partners
    // routinely write to from separate devices at close to the same
    // moment (Daily Couple Challenge, league lead, duel history). A plain
    // read-mutate-write silently drops whichever write lands second.
    async updateCouple(mutator) {
      for (let attempt = 0; attempt < 8; attempt++) {
        const { data: row, error: readErr } = await sb().from('couple').select('id, data, updated_at').eq('id', 'main').maybeSingle();
        if (readErr) throw readErr;
        if (!row) throw new Error('updateCouple: couple row missing (should be pre-seeded)');
        const c = rowToCouple(row);
        mutator(c);
        const { data: written, error } = await sb().from('couple')
          .update({ data: c, updated_at: new Date().toISOString() })
          .eq('id', 'main').eq('updated_at', row.updated_at)
          .select('id');
        if (error) throw error;
        if (written && written.length) return c;
      }
      throw new Error('updateCouple: too many concurrent write conflicts');
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
    },

    // Live updates: fires `onChange(table)` whenever the other device
    // writes to profiles/couple, so the League, Daily Challenge and duel
    // state can refresh without a manual reload. Requires both tables to
    // be in the supabase_realtime publication (supabase/schema.sql does
    // this). LocalDataProvider's no-op stub keeps app.js provider-agnostic.
    // Returns an unsubscribe function.
    subscribeToChanges(onChange) {
      const channel = sb().channel('fluentr-live')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => onChange('profiles'))
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'couple' }, () => onChange('couple'))
        .subscribe();
      return () => { sb().removeChannel(channel); };
    }
  };
})();
