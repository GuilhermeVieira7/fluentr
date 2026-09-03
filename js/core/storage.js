/* FLUENTR — core/storage.js
   Minimal promise-based IndexedDB wrapper. Two object stores:
   - "profiles" (keyPath 'id')  — one full state document per learner
   - "couple"   (keyPath 'id')  — shared couple-mode state, single row 'main'
   Nothing above this file should touch indexedDB directly — dataService.js
   is the only consumer, which keeps a future SupabaseDataProvider swap-in
   from requiring any change to storage.js. */

const FL_DB_NAME = 'fluentr_db';
const FL_DB_VERSION = 1;

function flTodayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

// Parses a "YYYY-MM-DD" string (as produced by flTodayISO, always local
// time) back into a local-midnight Date. `new Date("YYYY-MM-DD")` parses as
// UTC midnight per spec — for a negative UTC offset (e.g. Brazil, UTC-3)
// that lands on the *previous* local day, which silently shifted every
// Monday history entry into the prior ISO week when fed through
// flIsoWeekKey (which reads the Date back with local getters). Use this
// instead of `new Date(dateStr)` anywhere a stored "YYYY-MM-DD" needs to
// become a Date for local-calendar math.
function flParseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function flIsoWeekKey(date) {
  date = date || new Date();
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// "2d 14h left" until the current ISO week (Mon-Sun) ends — powers the
// Weekly Duel / Couple League countdown.
function flWeekTimeLeftLabel() {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // Mon=0..Sun=6
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() + (6 - dow));
  const ms = Math.max(0, end.getTime() - now.getTime());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days <= 0 && hours <= 0) return 'Ends soon';
  return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
}

const FluentrStorage = (function () {
  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error('IndexedDB not supported')); return; }
      const req = indexedDB.open(FL_DB_NAME, FL_DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('profiles')) db.createObjectStore('profiles', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('couple')) db.createObjectStore('couple', { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  function tx(storeName, mode) {
    return openDB().then((db) => db.transaction(storeName, mode).objectStore(storeName));
  }

  function get(storeName, key) {
    return tx(storeName, 'readonly').then((store) => new Promise((resolve, reject) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    }));
  }

  function getAll(storeName) {
    return tx(storeName, 'readonly').then((store) => new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    }));
  }

  function put(storeName, value) {
    return tx(storeName, 'readwrite').then((store) => new Promise((resolve, reject) => {
      const req = store.put(value);
      req.onsuccess = () => resolve(value);
      req.onerror = () => reject(req.error);
    }));
  }

  function del(storeName, key) {
    return tx(storeName, 'readwrite').then((store) => new Promise((resolve, reject) => {
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    }));
  }

  function clearAll() {
    return openDB().then((db) => new Promise((resolve, reject) => {
      const t = db.transaction(['profiles', 'couple'], 'readwrite');
      t.objectStore('profiles').clear();
      t.objectStore('couple').clear();
      t.oncomplete = () => resolve(true);
      t.onerror = () => reject(t.error);
    }));
  }

  return { openDB, get, getAll, put, delete: del, clearAll };
})();
