/* FLUENTR — lessonEngine.js
   Assembles sessions: Path lessons/challenges, Quick Practice, Smart Review,
   Heart Recovery, and "Spot the Brazilian." Also tracks Path unlock state. */

const FluentrLessonEngine = (function () {

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function poolForLesson(unitId, lessonId) {
    return window.WL_DATA.lessons.filter((e) => e.unit === unitId && e.lesson === lessonId).map((e) => ({ uid: e.id, type: e.type, unit: unitId, data: e }));
  }
  function poolForUnit(unitId) {
    return window.WL_DATA.lessons.filter((e) => e.unit === unitId).map((e) => ({ uid: e.id, type: e.type, unit: unitId, data: e }));
  }
  function allLessonItems() {
    return window.WL_DATA.lessons.map((e) => ({ uid: e.id, type: e.type, unit: e.unit, data: e }));
  }

  function buildLessonSession(unitId, lessonId) {
    let pool = shuffle(poolForLesson(unitId, lessonId));
    // pad toward ~8 items by re-shuffling in extra repeats, common in language-learning apps
    const items = pool.slice();
    let guard = 0;
    while (items.length < 8 && pool.length && guard < 20) {
      guard++;
      const extra = shuffle(pool).filter((p) => p.uid !== items[items.length - 1].uid);
      items.push(extra[0] || pool[0]);
    }
    return items;
  }

  function buildChallengeSession(unitId) {
    return shuffle(poolForUnit(unitId));
  }

  // ---- Path state ----
  function unitState(profile, unit) {
    const lessonsDone = unit.lessons.every((l) => (profile.pathProgress[l.id] || {}).completedCount > 0);
    return { lessonsDone };
  }

  function lessonState(profile, unit, lessonId) {
    const idx = unit.lessons.findIndex((l) => l.id === lessonId);
    const unitIdx = window.WL_CURRICULUM.findIndex((u) => u.id === unit.id);
    const prevUnit = window.WL_CURRICULUM[unitIdx - 1];
    const unitUnlocked = unitIdx === 0 || (prevUnit && (profile.pathProgress[prevUnit.challenge.id] || {}).completedCount > 0);

    const done = (profile.pathProgress[lessonId] || {}).completedCount > 0;
    const prevLessonInUnit = idx > 0 ? unit.lessons[idx - 1] : null;
    const prevDone = idx === 0 ? true : !!(profile.pathProgress[prevLessonInUnit.id] || {}).completedCount;

    let cls = 'locked';
    if (done) cls = 'done';
    else if (unitUnlocked && prevDone) cls = 'available';
    return { cls, prevDone: idx === 0 ? unitUnlocked : prevDone && unitUnlocked };
  }

  function challengeState(profile, unit) {
    const st = unitState(profile, unit);
    const done = (profile.pathProgress[unit.challenge.id] || {}).completedCount > 0;
    let cls = 'locked';
    if (done) cls = 'done'; else if (st.lessonsDone) cls = 'available';
    return { cls, prevDone: st.lessonsDone };
  }

  function findNextLesson(profile) {
    for (const unit of window.WL_CURRICULUM) {
      const totalInUnit = unit.lessons.length + 1; // + challenge
      const doneInUnit = unit.lessons.filter((l) => (profile.pathProgress[l.id] || {}).completedCount > 0).length
        + ((profile.pathProgress[unit.challenge.id] || {}).completedCount > 0 ? 1 : 0);
      for (const l of unit.lessons) {
        const st = lessonState(profile, unit, l.id);
        if (st.cls !== 'done') {
          const itemCount = poolForLesson(unit.id, l.id).length || 8;
          return {
            unitId: unit.id, unitName: unit.name, lessonId: l.id, lessonName: l.name,
            unitProgress: { done: doneInUnit, total: totalInUnit },
            estXP: FL_XP_RULES.LESSON_COMPLETE + Math.round(itemCount * FL_XP_RULES.ANSWER_CORRECT * 0.6),
            estMinutes: Math.max(2, Math.round(itemCount * 0.6))
          };
        }
      }
      const cst = challengeState(profile, unit);
      if (cst.cls !== 'done') {
        const itemCount = poolForUnit(unit.id).length || 10;
        return {
          unitId: unit.id, unitName: unit.name, lessonId: unit.challenge.id, lessonName: unit.challenge.name, isChallenge: !!cst,
          unitProgress: { done: doneInUnit, total: totalInUnit },
          estXP: FL_XP_RULES.LESSON_COMPLETE + Math.round(itemCount * FL_XP_RULES.ANSWER_CORRECT * 0.5),
          estMinutes: Math.max(3, Math.round(itemCount * 0.7))
        };
      }
    }
    return null;
  }

  // ---- Catch Up / Comeback: an XP-budgeted mixed session pulled from the
  // same weighted pools as Smart Review + Quick Study — no separate content
  // bank, so it scales with whatever the Path/pillars already contain.
  function buildComebackSession(profile, gapXP) {
    const perItem = FL_XP_RULES.ANSWER_CORRECT;
    const count = Math.max(6, Math.min(20, Math.ceil(gapXP / perItem)));
    const reviewHalf = Math.ceil(count / 2);
    const review = buildSmartReview(profile, reviewHalf);
    const fresh = weightedSession(profile, count - review.length).filter((x) => !review.find((y) => y.uid === x.uid));
    return shuffle(review.concat(fresh)).slice(0, count);
  }

  // ---- Quick practice / review ----
  function buildQuickStudy(profile, minutes) {
    const count = minutes <= 5 ? 6 : 10;
    return weightedSession(profile, count);
  }

  // Recently-served items get a heavy score penalty (not a hard exclude —
  // the pool is small) so the same handful of exercises don't resurface
  // session after session. See app.js startSession, which maintains
  // profile.recentlyServed as a ~40-item rolling window.
  function recentPenalty(profile, uid) {
    const recent = profile.recentlyServed || []; // oldest-first (see app.js startSession)
    const idx = recent.indexOf(uid);
    if (idx === -1) return 1;
    return 0.4 - (idx / Math.max(1, recent.length - 1)) * 0.3; // newest (high idx) ~0.1x, oldest-in-window (low idx) ~0.4x
  }

  function weightedSession(profile, count) {
    const items = allLessonItems();
    const weighted = items.map((it) => {
      const stat = profile.exerciseStats[it.uid];
      let w = 1;
      if (stat && stat.seen) w += (stat.incorrect / stat.seen) * 3;
      if (!stat) w += 0.4;
      w *= recentPenalty(profile, it.uid);
      return { it, score: Math.random() * w };
    }).sort((a, b) => b.score - a.score);
    return weighted.slice(0, count).map((w) => w.it);
  }

  function buildSmartReview(profile, count) {
    count = count || 10;
    const now = Date.now();
    const candidates = [];
    allLessonItems().forEach((it) => {
      const stat = profile.exerciseStats[it.uid];
      if (!stat) return;
      const isDue = !!stat.dueAt && new Date(stat.dueAt).getTime() <= now;
      let score = 0;
      if (isDue) score += 10; // due for spaced review — top priority
      if (stat.lastCorrect === false) score += 5;
      if (stat.seen) score += (stat.incorrect / stat.seen) * 3;
      if (stat.lastAnsweredAt) score += Math.min(2, (now - new Date(stat.lastAnsweredAt).getTime()) / (86400000 * 5));
      score *= recentPenalty(profile, it.uid);
      if (score > 0) candidates.push({ it, score, isDue });
    });
    candidates.sort((a, b) => b.score - a.score);
    let items = candidates.slice(0, count).map((c) => c.it);
    if (items.length < count) items = items.concat(weightedSession(profile, count - items.length).filter((x) => !items.find((y) => y.uid === x.uid)));
    return shuffle(items);
  }

  // ---- Adaptive session: 70% weak/new, 20% due-for-review, 10% mastered
  // (confidence reinforcement) — a firmer split than buildSmartReview's pure
  // score ranking. Lives alongside buildSmartReview/buildQuickStudy rather
  // than replacing them.
  function buildAdaptiveSession(profile, count) {
    count = count || 10;
    const now = Date.now();
    const buckets = { new: [], weak: [], learning: [], mastered: [] };
    allLessonItems().forEach((it) => {
      const stat = profile.exerciseStats[it.uid];
      const level = FluentrGamification.masteryLevel(stat);
      const isDue = !!(stat && stat.dueAt && new Date(stat.dueAt).getTime() <= now);
      buckets[level].push({ it, stat, isDue });
    });

    function pick(list, n, opts) {
      opts = opts || {};
      const scored = list.map((entry) => {
        let score = Math.random();
        if (opts.dueFirst && entry.isDue) score += 5;
        score *= recentPenalty(profile, entry.it.uid);
        return { entry, score };
      }).sort((a, b) => b.score - a.score);
      return scored.slice(0, n).map((s) => s.entry.it);
    }

    const weakNewTarget = Math.round(count * 0.7);
    const dueTarget = Math.round(count * 0.2);
    const masteredTarget = Math.max(0, count - weakNewTarget - dueTarget);

    const weakNewPool = buckets.weak.concat(buckets.new);
    const weakNew = pick(weakNewPool, weakNewTarget);
    const usedUids = new Set(weakNew.map((it) => it.uid));

    const duePool = buckets.learning.concat(buckets.weak, buckets.new).filter((e) => e.isDue && !usedUids.has(e.it.uid));
    const due = pick(duePool, dueTarget, { dueFirst: true });
    due.forEach((it) => usedUids.add(it.uid));

    const masteredPool = buckets.mastered.filter((e) => !usedUids.has(e.it.uid));
    const mastered = pick(masteredPool, masteredTarget);
    mastered.forEach((it) => usedUids.add(it.uid));

    let items = weakNew.concat(due, mastered);
    if (items.length < count) {
      const fallback = weightedSession(profile, count - items.length).filter((x) => !usedUids.has(x.uid));
      items = items.concat(fallback);
    }
    return shuffle(items).slice(0, count);
  }

  function buildHeartRecovery() {
    const easy = window.WL_DATA.lessons.filter((e) => e.level === 'A1' || e.level === 'A2');
    return shuffle(easy).slice(0, 5).map((e) => ({ uid: e.id, type: e.type, unit: e.unit, data: e }));
  }

  // ---- Spot the Brazilian (built on the fly from traps.js) ----
  function buildSpotBrazilian(count) {
    count = count || 8;
    const traps = shuffle(window.WL_DATA.traps).slice(0, count);
    return traps.map((t) => {
      const distractors = shuffle(window.WL_DATA.traps.filter((x) => x.id !== t.id)).slice(0, 2).map((x) => x.right);
      const options = shuffle([t.right, ...distractors]);
      return { id: t.id, question: `What's the natural way to say: "${t.wrong}"?`, options, answer: options.indexOf(t.right), explanation: t.explanation, pt: t.pt, category: t.category, level: t.level };
    });
  }

  // ---- Daily couple challenge (deterministic by date) ----
  function dailyCoupleChallengeFor(dateISO) {
    const pool = window.WL_DATA.coupleChallenges;
    const dayIndex = Math.floor(new Date(dateISO).getTime() / 86400000);
    return pool[dayIndex % pool.length];
  }

  // ---- Weekly recap ----
  function buildWeeklyRecap(profile) {
    const wk = FluentrGamification.weekKey();
    const weekEntries = (profile.history || []).filter((h) => flIsoWeekKey(new Date(h.date)) === wk);
    const xp = weekEntries.reduce((a, h) => a + h.xp, 0);
    const exercises = weekEntries.length;
    const stats = FluentrGamification.buildStats(profile);
    return {
      exercises, xp, accuracy: stats.accuracy,
      newPhrases: Object.keys(profile.vocabulary).length,
      best: 'Technical English', weak: 'Professional Writing'
    };
  }

  return {
    poolForLesson, poolForUnit, allLessonItems, buildLessonSession, buildChallengeSession,
    lessonState, challengeState, findNextLesson,
    buildQuickStudy, buildSmartReview, buildAdaptiveSession, buildHeartRecovery, buildSpotBrazilian, buildComebackSession,
    dailyCoupleChallengeFor, buildWeeklyRecap, shuffle
  };
})();
