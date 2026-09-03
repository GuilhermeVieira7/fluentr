/* FLUENTR — core/dataService.js
   Defines LocalDataProvider (IndexedDB + localStorage) — one of two
   implementations of the FluentrData interface the rest of the app talks to
   for persistence. See core/supabaseDataProvider.js for the other, and
   core/dataServiceSelect.js for how `FluentrData` picks between them.
   Both implement the exact same method signatures — see README, "Online
   Couple Mode" — so app.js/ui.js/lessonEngine.js never need to change. */

const FL_KNOWN_PROFILES = [
  { id: 'guilherme', name: 'Guilherme', color: '#5b3df5' },
  { id: 'rayssa', name: 'Rayssa', color: '#f03a6d' }
];

function flDefaultProfile(id, name, color) {
  return {
    id, name, color, createdAt: flTodayISO(),
    photo: null, // { dataUrl, posY } — set via Profile page upload; null falls back to initials
    onboarded: false, goal: null, cefrLevel: null,
    placementResult: null,
    xp: 0,
    hearts: { count: 5, lastRegenAt: new Date().toISOString() },
    streak: { current: 0, best: 0, lastActiveDate: null, activeDates: [] },
    badges: [],
    exerciseStats: {}, // exerciseId -> {seen, correct, incorrect, lastAnsweredAt, lastCorrect, interval, dueAt}
    recentlyServed: [], // rolling window (~40) of recently shown exercise ids — avoids back-to-back repeats
    vocabulary: {},    // term -> {meaning, example, category, seen, correct, lastSeen}
    history: [],       // recent activity feed
    pathProgress: {},  // lessonId -> {completedCount, bestAccuracy, lastCompletedAt}
    weeklyXP: {},       // isoWeekKey -> xp (for league/duel history)
    duelHistory: [],
    settings: { dailyGoalXP: 30, notifyStreak: false },
    counters: { lessonsCompleted: 0, perfectLessons: 0, duelsWon: 0, duelsPlayed: 0, coupleChallengesCompleted: 0 },
    unitActivity: {},    // unitId -> count of correct answers within that path unit
    pillarActivity: { traps: 0, sos: 0, say: 0, writing: 0, technical: 0 }
  };
}

function flDefaultCouple() {
  return {
    id: 'main',
    streak: { current: 0, best: 0, lastBothActiveDate: null },
    weeklyChampions: [], // { week, winnerId, guilhermeXP, rayssaXP }
    lastLeaderId: null,   // last-known weekly XP leader, used to detect lead changes once (not repeat toast)
    dailyChallenge: { date: null, exerciseId: null, completions: {} }, // completions: {profileId: true}
    pendingDuel: null,   // { id, topic, level, exerciseIds, results: {profileId:{score,timeSec}} }
    duelHistory: []       // completed duels
  };
}

// Backfills any top-level field a saved document predates (new profile/couple
// fields added after that document was first created) with the current
// default, without touching fields that already exist. Every read path goes
// through this, so schema growth never needs a one-off manual migration.
function flMigrateProfile(p) {
  if (!p) return p;
  const defaults = flDefaultProfile(p.id, p.name, p.color);
  Object.keys(defaults).forEach((k) => { if (p[k] === undefined) p[k] = defaults[k]; });
  return p;
}
function flMigrateCouple(c) {
  if (!c) return c;
  const defaults = flDefaultCouple();
  Object.keys(defaults).forEach((k) => { if (c[k] === undefined) c[k] = defaults[k]; });
  return c;
}

// Exposed globally (not wrapped in an IIFE) so js/core/dataServiceSelect.js
// can choose between this and SupabaseDataProvider once both are loaded —
// see that file for why the choice can't be made from inside this one.
const LocalDataProvider = {
    async listProfiles() {
      const rows = await FluentrStorage.getAll('profiles');
      return rows.map(flMigrateProfile);
    },

    async getProfile(id) {
      return flMigrateProfile(await FluentrStorage.get('profiles', id));
    },

    async ensureProfile(id) {
      let p = await this.getProfile(id);
      if (!p) {
        const known = FL_KNOWN_PROFILES.find((k) => k.id === id);
        p = flDefaultProfile(id, known ? known.name : id, known ? known.color : '#5b3df5');
        await FluentrStorage.put('profiles', p);
      }
      return p;
    },

    async saveProfile(profile) {
      return FluentrStorage.put('profiles', profile);
    },

    async updateProfile(id, mutator) {
      const p = await this.ensureProfile(id);
      mutator(p);
      await FluentrStorage.put('profiles', p);
      return p;
    },

    async getCouple() {
      let c = await FluentrStorage.get('couple', 'main');
      if (!c) { c = flDefaultCouple(); await FluentrStorage.put('couple', c); }
      return flMigrateCouple(c);
    },

    async updateCouple(mutator) {
      const c = await this.getCouple();
      mutator(c);
      await FluentrStorage.put('couple', c);
      return c;
    },

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
        for (const p of data.profiles) await FluentrStorage.put('profiles', p);
      }
      if (data.couple) await FluentrStorage.put('couple', data.couple);
      return true;
    },

    async resetProfile(id) {
      const known = FL_KNOWN_PROFILES.find((k) => k.id === id);
      const fresh = flDefaultProfile(id, known ? known.name : id, known ? known.color : '#5b3df5');
      await FluentrStorage.put('profiles', fresh);
      return fresh;
    },

    async resetAll() {
      await FluentrStorage.clearAll();
    }
  };
