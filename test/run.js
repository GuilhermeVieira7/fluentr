/* FLUENTR — test suite (pure logic, no framework, no build step)
   Loads the real source files into one shared vm context, mirroring exactly
   how index.html loads them via <script> tags (a shared global scope, not
   CommonJS modules) — so functions like flTodayISO() and window.WL_DATA
   resolve the same way they do in the browser. Run with: node test/run.js */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');

const sandbox = {};
sandbox.window = sandbox;
sandbox.console = console;
sandbox.localStorage = (() => {
  const store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  };
})();
vm.createContext(sandbox);

const FILES = [
  'data/curriculum.js', 'data/badges.js', 'data/traps.js', 'data/say.js', 'data/writing.js',
  'data/technical.js', 'data/sos.js', 'data/lessons.js', 'data/coupleChallenges.js',
  'data/simulators.js', 'data/placement.js',
  'js/core/storage.js', 'js/core/dataService.js', 'js/core/gamification.js',
  'js/lessonEngine.js'
];
FILES.forEach((f) => {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  vm.runInContext(src, sandbox, { filename: f });
});

// Classic <script> tags (and, identically, sequential vm.runInContext calls in
// one context) share a top-level lexical scope for let/const, but const
// bindings never become properties of the global object itself — so
// `sandbox.FluentrGamification` is undefined even though the bare identifier
// resolves fine *inside* the context. Bridge them out explicitly.
vm.runInContext(
  'window.__bridge__ = { FluentrGamification, FluentrLessonEngine, flDefaultProfile, flDefaultCouple };',
  sandbox
);
const { FluentrGamification, FluentrLessonEngine, flDefaultProfile, flDefaultCouple } = sandbox.__bridge__;

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok   ' + name); }
  catch (e) { failed++; console.error('  FAIL ' + name + '\n       ' + e.message); }
}
function section(name) { console.log('\n' + name); }

section('core/gamification.js — XP, levels, streaks');

test('levelInfo: level 1 at 0 XP', () => {
  assert.strictEqual(FluentrGamification.levelInfo(0).level, 1);
});

test('awardXP: increases profile.xp and logs history', () => {
  const p = flDefaultProfile('t1', 'Test', '#fff');
  FluentrGamification.awardXP(p, 10, 'test');
  assert.strictEqual(p.xp, 10);
  assert.strictEqual(p.history[0].xp, 10);
});

test('recordAnswer: applies the anti-farm cooldown on an immediate repeat', () => {
  const p = flDefaultProfile('t2', 'Test', '#fff');
  const r1 = FluentrGamification.recordAnswer(p, 'ex-1', true, 5);
  assert.strictEqual(r1.xpAwarded, 5);
  const r2 = FluentrGamification.recordAnswer(p, 'ex-1', true, 5);
  assert.strictEqual(r2.xpAwarded, 1, 'repeat within the cooldown window should award reduced XP, not full XP');
});

test('recordAnswer: schedules a future spaced-repetition dueAt on a correct answer', () => {
  const p = flDefaultProfile('t3', 'Test', '#fff');
  FluentrGamification.recordAnswer(p, 'ex-2', true, 5);
  const stat = p.exerciseStats['ex-2'];
  assert.ok(stat.dueAt, 'dueAt should be set');
  assert.ok(new Date(stat.dueAt).getTime() > Date.now(), 'dueAt should be in the future after a correct answer');
});

test('recordAnswer: a miss resets the interval back to 1 day', () => {
  const p = flDefaultProfile('t3b', 'Test', '#fff');
  FluentrGamification.recordAnswer(p, 'ex-2b', true, 5);
  FluentrGamification.recordAnswer(p, 'ex-2b', true, 5); // interval grows
  FluentrGamification.recordAnswer(p, 'ex-2b', false, 5); // miss resets it
  assert.strictEqual(p.exerciseStats['ex-2b'].interval, 1);
});

test('updateStreak: increments once per day, never double-counts the same day', () => {
  const p = flDefaultProfile('t4', 'Test', '#fff');
  const r1 = FluentrGamification.updateStreak(p);
  assert.strictEqual(r1.current, 1);
  const r2 = FluentrGamification.updateStreak(p);
  assert.strictEqual(r2.changed, false, 'a second call the same day must not change the streak');
});

test('computeLessonCompletionXP: repeat completion only awards the smaller base', () => {
  const p = flDefaultProfile('t5', 'Test', '#fff');
  const b = FluentrGamification.computeLessonCompletionXP(p, { firstTime: false, accuracy: 1 });
  assert.strictEqual(b.total, 8);
});

test('computeLessonCompletionXP: first-time perfect run awards the perfect bonus', () => {
  const p = flDefaultProfile('t6', 'Test', '#fff');
  const b = FluentrGamification.computeLessonCompletionXP(p, { firstTime: true, accuracy: 1 });
  assert.ok(b.perfectBonus > 0, 'perfectBonus should be > 0 for a first-time 100% run');
});

test('finalizeWeekIfNeeded: records a completed week exactly once (idempotent)', () => {
  const c = flDefaultCouple();
  const a = flDefaultProfile('a', 'A', '#111');
  const b = flDefaultProfile('b', 'B', '#222');
  a.weeklyXP['2024-W01'] = 100; b.weeklyXP['2024-W01'] = 50;
  c.lastSeenWeek = '2024-W01';
  FluentrGamification.finalizeWeekIfNeeded(c, a, b);
  const countAfterCross = c.weeklyChampions.length;
  FluentrGamification.finalizeWeekIfNeeded(c, a, b); // same "current" week now — must not duplicate
  assert.strictEqual(c.weeklyChampions.length, countAfterCross);
});

section('data/badges.js — regression guard for the unit-id bug');

test('every unitActivity[...] key referenced by a badge check exists in WL_CURRICULUM', () => {
  const validIds = new Set(sandbox.window.WL_CURRICULUM.map((u) => u.id));
  const bad = [];
  sandbox.window.WL_BADGES.forEach((b) => {
    const src = b.check.toString();
    const refs = [...src.matchAll(/unitActivity\[.([a-zA-Z0-9_-]+)./g)].map((m) => m[1]);
    refs.forEach((r) => { if (!validIds.has(r)) bad.push(b.id + ' -> ' + r); });
  });
  assert.deepStrictEqual(bad, [], 'badges referencing nonexistent unit ids can never be unlocked');
});

test('checkBadges never throws, even with an empty ctx', () => {
  const p = flDefaultProfile('t7', 'Test', '#fff');
  assert.doesNotThrow(() => FluentrGamification.checkBadges(p, {}));
});

section('lessonEngine.js — session assembly');

test('buildLessonSession only returns items from the requested unit', () => {
  const items = FluentrLessonEngine.buildLessonSession('u1', 'u1-l1');
  assert.ok(items.length > 0);
  items.forEach((it) => assert.strictEqual(it.unit, 'u1'));
});

test('findNextLesson points at the first unit for a fresh profile', () => {
  const p = flDefaultProfile('t8', 'Test', '#fff');
  const next = FluentrLessonEngine.findNextLesson(p);
  assert.ok(next && next.unitId === 'u1');
});

test('buildComebackSession clamps its size between 6 and 20', () => {
  const p = flDefaultProfile('t9', 'Test', '#fff');
  assert.strictEqual(FluentrLessonEngine.buildComebackSession(p, 5).length, 6);
  assert.strictEqual(FluentrLessonEngine.buildComebackSession(p, 1000).length, 20);
});

test('buildSpotBrazilian never has a duplicate option in the same question', () => {
  const qs = FluentrLessonEngine.buildSpotBrazilian(10);
  qs.forEach((q) => assert.strictEqual(new Set(q.options).size, q.options.length));
});

section('data content integrity');

test('every Path lesson and Trap has a pt (Portuguese feedback) field', () => {
  // .length, not deepStrictEqual against an outer-realm [] literal — arrays
  // produced by vm-context data belong to a different realm, so structural
  // equality checks that also compare prototypes would false-fail here.
  const missingLessons = sandbox.window.WL_DATA.lessons.filter((x) => !x.pt);
  const missingTraps = sandbox.window.WL_DATA.traps.filter((x) => !x.pt);
  assert.strictEqual(missingLessons.length, 0, 'lessons missing pt: ' + Array.from(missingLessons).map((x) => x.id).join(', '));
  assert.strictEqual(missingTraps.length, 0, 'traps missing pt: ' + Array.from(missingTraps).map((x) => x.id).join(', '));
});

test('no duplicate ids across lessons + traps', () => {
  const ids = Array.from(sandbox.window.WL_DATA.lessons).concat(Array.from(sandbox.window.WL_DATA.traps)).map((x) => x.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
