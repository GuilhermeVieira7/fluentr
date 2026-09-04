/* FLUENTR — core/gamification.js
   XP, game levels (separate from CEFR), hearts, streaks (individual +
   couple), and badge evaluation. Pure-ish functions over profile/couple
   state objects from dataService. */

const FL_XP_RULES = {
  ANSWER_CORRECT: 5,
  ANSWER_CORRECT_COOLDOWN: 1, // reduced XP for repeating an already-answered item within the cooldown window
  LESSON_COMPLETE: 25,
  PERFECT_LESSON_BONUS: 15,
  DAILY_CHALLENGE: 30,
  SOS_COMPLETE: 15,
  TECHNICAL_SCENARIO: 20,
  DUEL_VICTORY: 25,
  FIRST_ACTIVITY_OF_DAY: 10,
  COOLDOWN_MS: 4 * 60 * 60 * 1000,
  HEART_REGEN_MS: 4 * 60 * 60 * 1000,
  MAX_HEARTS: 5
};

const FluentrGamification = (function () {

  function buildLevelCurve() {
    const levels = [];
    let cumulative = 0;
    for (let n = 1; n <= 60; n++) {
      if (n > 1) cumulative += Math.round(180 + (n - 1) * 42 + Math.pow(n, 1.5) * 6);
      levels.push({ level: n, xp: cumulative });
    }
    return levels;
  }
  const _curve = buildLevelCurve();

  function levelInfo(totalXP) {
    let current = _curve[0], next = _curve[1];
    for (let i = 0; i < _curve.length; i++) {
      if (totalXP >= _curve[i].xp) { current = _curve[i]; next = _curve[i + 1] || null; }
      else break;
    }
    const span = next ? next.xp - current.xp : 1;
    const progress = next ? Math.min(1, (totalXP - current.xp) / span) : 1;
    return { level: current.level, nextThreshold: next ? next.xp : null, xpForNext: next ? next.xp - totalXP : 0, progress };
  }

  function awardXP(profile, amount, label) {
    if (amount <= 0) return 0;
    profile.xp += amount;
    profile.history.unshift({ ts: new Date().toISOString(), date: flTodayISO(), label, xp: amount });
    if (profile.history.length > 300) profile.history.length = 300;
    // Every XP source funnels through here, so this is the one place that
    // needs to touch weeklyXP — it used to be added ad-hoc by individual
    // call sites (finishSession only), which meant Duel wins, Technical
    // Scenario XP, simulator completions, and the Daily Couple Challenge
    // bonus silently never counted toward the Couple League standings.
    addWeeklyXP(profile, amount);
    return amount;
  }

  // Records one exercise attempt with anti-farm cooldown. Returns {xpAwarded, correct, firstTime}.
  // Also maintains a light SM-2-style schedule (interval in days, dueAt) per
  // item: correct answers push the item further out, a miss resets it to
  // "review tomorrow" — this is what buildSmartReview prioritizes.
  function recordAnswer(profile, exerciseId, isCorrect, xpFull) {
    xpFull = xpFull || FL_XP_RULES.ANSWER_CORRECT;
    const stat = profile.exerciseStats[exerciseId] || { seen: 0, correct: 0, incorrect: 0, lastAnsweredAt: null, lastCorrect: null, interval: 0, dueAt: null };
    const now = Date.now();
    const onCooldown = stat.lastAnsweredAt && (now - new Date(stat.lastAnsweredAt).getTime()) < FL_XP_RULES.COOLDOWN_MS;

    stat.seen += 1;
    if (isCorrect) stat.correct += 1; else stat.incorrect += 1;
    stat.lastAnsweredAt = new Date().toISOString();
    stat.lastCorrect = isCorrect;
    stat.interval = isCorrect ? Math.min(60, Math.max(1, Math.round((stat.interval || 0) * 1.8))) : 1;
    stat.dueAt = new Date(now + stat.interval * 86400000).toISOString();
    profile.exerciseStats[exerciseId] = stat;

    let xp = 0;
    if (isCorrect) {
      xp = onCooldown ? FL_XP_RULES.ANSWER_CORRECT_COOLDOWN : xpFull;
      awardXP(profile, xp, onCooldown ? 'Review answer' : 'Correct answer');
    }
    return { xpAwarded: xp, correct: isCorrect, onCooldown };
  }

  // Categorical mastery derived from the same exerciseStats used for SM-2
  // scheduling — 'new'|'learning'|'weak'|'mastered'. Used by buildAdaptiveSession's
  // 70/20/10 split and by the vocabulary list's mastery labels/filters.
  function masteryLevel(stat) {
    if (!stat || !stat.seen) return 'new';
    const acc = stat.correct / stat.seen;
    if (stat.lastCorrect === false || acc < 0.5) return 'weak';
    if (stat.seen >= 3 && acc >= 0.85) return 'mastered';
    return 'learning';
  }

  function regenHearts(profile) {
    if (profile.hearts.count >= FL_XP_RULES.MAX_HEARTS) { profile.hearts.lastRegenAt = new Date().toISOString(); return; }
    const elapsed = Date.now() - new Date(profile.hearts.lastRegenAt).getTime();
    const gained = Math.floor(elapsed / FL_XP_RULES.HEART_REGEN_MS);
    if (gained > 0) {
      profile.hearts.count = Math.min(FL_XP_RULES.MAX_HEARTS, profile.hearts.count + gained);
      profile.hearts.lastRegenAt = new Date(new Date(profile.hearts.lastRegenAt).getTime() + gained * FL_XP_RULES.HEART_REGEN_MS).toISOString();
    }
  }

  function loseHeart(profile) {
    profile.hearts.count = Math.max(0, profile.hearts.count - 1);
    if (profile.hearts.count < FL_XP_RULES.MAX_HEARTS) profile.hearts.lastRegenAt = profile.hearts.lastRegenAt || new Date().toISOString();
  }

  function gainHeart(profile, n) {
    profile.hearts.count = Math.min(FL_XP_RULES.MAX_HEARTS, profile.hearts.count + (n || 1));
  }

  // Returns { changed, current, isFirstActivityToday, usedFreeze }
  // Streak freeze: one per ISO week (profile.streak.freezesAvailable,
  // refilled here the first time a given week is seen — no separate
  // migration needed since old profiles just start at 0 until their next
  // natural week rollover). Exactly one missed day is forgivable; missing
  // two or more still resets the streak even with a freeze in hand.
  function updateStreak(profile) {
    const today = flTodayISO();
    if (profile.streak.lastActiveDate === today) return { changed: false, current: profile.streak.current, isFirstActivityToday: false };

    const wk = weekKey();
    if (profile.streak.freezeWeek !== wk) {
      profile.streak.freezesAvailable = 1;
      profile.streak.freezeWeek = wk;
    }

    const yesterday = new Date(Date.now() - 86400000);
    const yISO = new Date(yesterday.getTime() - yesterday.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    let usedFreeze = false;
    if (profile.streak.lastActiveDate === yISO) {
      profile.streak.current += 1;
    } else if (profile.streak.lastActiveDate) {
      const daysMissed = Math.round((flParseLocalDate(today) - flParseLocalDate(profile.streak.lastActiveDate)) / 86400000) - 1;
      if (daysMissed === 1 && (profile.streak.freezesAvailable || 0) > 0) {
        profile.streak.freezesAvailable -= 1;
        profile.streak.current += 1;
        usedFreeze = true;
      } else {
        profile.streak.current = 1;
      }
    } else {
      profile.streak.current = 1;
    }
    profile.streak.lastActiveDate = today;
    profile.streak.best = Math.max(profile.streak.best, profile.streak.current);
    if (!profile.streak.activeDates.includes(today)) {
      profile.streak.activeDates.push(today);
      if (profile.streak.activeDates.length > 400) profile.streak.activeDates.shift();
    }
    return { changed: true, current: profile.streak.current, isFirstActivityToday: true, usedFreeze };
  }

  // Derives the couple streak by walking back from today over both profiles' activeDates.
  function computeCoupleStreak(couple, profileA, profileB) {
    const setA = new Set(profileA.streak.activeDates || []);
    const setB = new Set(profileB.streak.activeDates || []);
    let count = 0;
    for (let i = 0; i < 400; i++) {
      const d = new Date(Date.now() - i * 86400000);
      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      if (setA.has(iso) && setB.has(iso)) count++;
      else break;
    }
    couple.streak.current = count;
    couple.streak.best = Math.max(couple.streak.best || 0, count);
    return count;
  }

  function weekKey() { return flIsoWeekKey(new Date()); }

  function addWeeklyXP(profile, amount) {
    const wk = weekKey();
    profile.weeklyXP[wk] = (profile.weeklyXP[wk] || 0) + amount;
  }

  function buildStats(profile) {
    const li = levelInfo(profile.xp);
    const answered = Object.values(profile.exerciseStats).reduce((a, s) => a + s.seen, 0);
    const correct = Object.values(profile.exerciseStats).reduce((a, s) => a + s.correct, 0);
    return {
      level: li.level, xpForNext: li.xpForNext, progress: li.progress, totalXP: profile.xp,
      currentStreak: profile.streak.current, bestStreak: profile.streak.best,
      totalAnswered: answered, accuracy: answered ? correct / answered : 0,
      badgesCount: profile.badges.length, hearts: profile.hearts.count,
      vocabCount: Object.keys(profile.vocabulary).length,
      weeklyXP: profile.weeklyXP[weekKey()] || 0
    };
  }

  // Consistent, non-arbitrary completion-bonus formula: every component ties
  // to a real, visible piece of profile state (first attempt, accuracy,
  // active streak, perfect round) instead of a flat magic number.
  function computeLessonCompletionXP(profile, { firstTime, accuracy }) {
    const base = firstTime ? FL_XP_RULES.LESSON_COMPLETE : 8;
    const accuracyBonus = firstTime ? Math.round(accuracy * 10) : 0;
    const streakBonus = firstTime && profile.streak.current >= 3 ? 5 : 0;
    const perfectBonus = firstTime && accuracy === 1 ? FL_XP_RULES.PERFECT_LESSON_BONUS : 0;
    return { base, accuracyBonus, streakBonus, perfectBonus, total: base + accuracyBonus + streakBonus + perfectBonus };
  }

  // Records the previous week's XP winner into couple.weeklyChampions the
  // first time the app is opened after that week ends — powers the League's
  // "Last 4 weeks" history. Idempotent: never records the same week twice.
  function finalizeWeekIfNeeded(couple, profileA, profileB) {
    const currentWeek = weekKey();
    if (!couple.lastSeenWeek) { couple.lastSeenWeek = currentWeek; return; }
    if (couple.lastSeenWeek === currentWeek) return;
    const prevWeek = couple.lastSeenWeek;
    const xpA = (profileA.weeklyXP || {})[prevWeek] || 0;
    const xpB = (profileB.weeklyXP || {})[prevWeek] || 0;
    couple.weeklyChampions = couple.weeklyChampions || [];
    const alreadyRecorded = couple.weeklyChampions.some((w) => w.week === prevWeek);
    if (!alreadyRecorded && (xpA > 0 || xpB > 0)) {
      const winnerId = xpA === xpB ? null : (xpA > xpB ? profileA.id : profileB.id);
      const winnerName = winnerId === profileA.id ? profileA.name : winnerId === profileB.id ? profileB.name : 'Tie';
      couple.weeklyChampions.push({ week: prevWeek, winnerId, winnerName, [profileA.id + 'XP']: xpA, [profileB.id + 'XP']: xpB });
      if (couple.weeklyChampions.length > 20) couple.weeklyChampions.shift();
    }
    couple.lastSeenWeek = currentWeek;
  }

  // "Your English" skill breakdown for the Profile page. Vocabulary/Grammar/
  // Writing/Technical are derived from real tracked data (exerciseStats,
  // vocabulary, pillarActivity) — Listening/Speaking have no audio pipeline
  // in this build, so they're marked unavailable rather than faked.
  function buildSkillBreakdown(profile) {
    const grammarStat = { seen: 0, correct: 0 };
    Object.entries(profile.exerciseStats || {}).forEach(([id, stat]) => {
      const item = (window.WL_DATA && window.WL_DATA.lessons || []).find((e) => e.id === id);
      if (!item || item.type === 'match') return;
      grammarStat.seen += stat.seen; grammarStat.correct += stat.correct;
    });
    const vocabScore = Math.min(1, Object.keys(profile.vocabulary || {}).length / 100);
    const grammarScore = grammarStat.seen ? grammarStat.correct / grammarStat.seen : 0;
    const writingScore = Math.min(1, (profile.pillarActivity.writing || 0) / 30);
    const technicalScore = Math.min(1, (profile.pillarActivity.technical || 0) / 30);
    return [
      { key: 'vocabulary', label: 'Vocabulary', value: vocabScore, available: true },
      { key: 'grammar', label: 'Grammar', value: grammarScore, available: true },
      { key: 'listening', label: 'Listening', value: 0, available: false },
      { key: 'speaking', label: 'Speaking', value: 0, available: false },
      { key: 'writing', label: 'Writing', value: writingScore, available: true },
      { key: 'technical', label: 'Technical English', value: technicalScore, available: true }
    ];
  }

  function checkBadges(profile, ctx) {
    const stats = buildStats(profile);
    const newly = [];
    (window.WL_BADGES || []).forEach((b) => {
      if (profile.badges.includes(b.id)) return;
      try {
        if (b.check(stats, profile, ctx || {})) { profile.badges.push(b.id); newly.push(b); }
      } catch (e) { /* ignore malformed check */ }
    });
    return newly;
  }

  return {
    levelInfo, awardXP, recordAnswer, regenHearts, loseHeart, gainHeart,
    updateStreak, computeCoupleStreak, weekKey, addWeeklyXP, buildStats, checkBadges,
    computeLessonCompletionXP, finalizeWeekIfNeeded, buildSkillBreakdown, masteryLevel
  };
})();
