/* FLUENTR — app.js
   Boot sequence, in-memory app state, session players, and all
   [data-action] event handling. Talks to persistence only through
   FluentrData (core/dataService.js) — never touches IndexedDB directly. */

const FluentrApp = (function () {
  const shellEl = document.getElementById('app-shell');

  const AppState = {
    screen: 'loading', route: 'home',
    profile: null, otherProfile: null, couple: null,
    session: null, itemState: null,
    placement: null, simulator: null, duel: null,
    say: { query: '', results: null },
    writing: { openId: null, tone: 'correct' },
    technical: { openId: null, audience: null },
    traps: { filter: '' },
    sos: { view: 'hub', packId: null, catId: null, warmup: null },
    onboardingId: null,
    aiChat: { scenario: null, history: [], busy: false, lastCorrection: null, listening: false },
    aiWriting: { text: '', result: null, busy: false },
    settingsBackups: null
  };

  function currentHearts() { return AppState.profile ? AppState.profile.hearts.count : 5; }

  // Shared badge-check context — several badges (Power Couple, English Duo)
  // need couple-derived signals that aren't on `profile` alone; without this,
  // those badges were previously unreachable because ctx was passed as {}.
  function badgeCtx(extra) {
    return Object.assign({
      coupleStreak: AppState.couple ? AppState.couple.streak.current : 0,
      combinedLessons: AppState.profile.counters.lessonsCompleted + (AppState.otherProfile ? AppState.otherProfile.counters.lessonsCompleted : 0)
    }, extra || {});
  }

  /* ============ Persistence helpers ============ */

  // Most call sites fire this without awaiting or catching it — under
  // SupabaseDataProvider a network hiccup makes saveProfile throw, which
  // used to become a silently-swallowed unhandled rejection: XP/hearts/
  // streak changes would vanish on next reload with zero indication
  // anything went wrong. This can't retry on its own (the failed write is
  // already gone), but it at least tells the user once — rate-limited so a
  // stretch of offline play doesn't spam a toast on every single answer.
  let lastPersistFailureToastAt = 0;
  async function persistProfile() {
    if (!AppState.profile) return;
    try {
      await FluentrData.saveProfile(AppState.profile);
    } catch (e) {
      const now = Date.now();
      if (now - lastPersistFailureToastAt > 30000) {
        lastPersistFailureToastAt = now;
        FluentrUI.showToast('Could not save your progress', 'Check your connection.', null);
      }
    }
  }

  async function refreshBoth() {
    const otherId = AppState.profile.id === 'guilherme' ? 'rayssa' : 'guilherme';
    const [mine, theirs] = await Promise.all([
      FluentrData.getProfile(AppState.profile.id),
      FluentrData.ensureProfile(otherId)
    ]);
    AppState.profile = mine;
    AppState.otherProfile = theirs;
  }

  /* ============ Boot ============ */

  async function boot() {
    shellEl.innerHTML = FluentrUI.renderBootSkeleton();
    FluentrPWA.registerServiceWorker();
    FluentrPWA.listenForInstallPrompt(() => { if (AppState.route === 'settings') render(); });

    const theme = FluentrData.getTheme();
    applyTheme(theme);

    const activeId = FluentrData.getActiveProfileId();
    if (!activeId) { await showGate(); return; }

    await enterProfile(activeId);
  }

  async function showGate() {
    const list = await FluentrData.listProfiles();
    AppState.screen = 'gate';
    shellEl.innerHTML = FluentrUI.renderProfileGate(list.map((p) => p.id));
  }

  async function enterProfile(id) {
    shellEl.innerHTML = FluentrUI.renderBootSkeleton();
    FluentrData.setActiveProfileId(id);
    AppState.profile = await FluentrData.ensureProfile(id);
    FluentrGamification.regenHearts(AppState.profile);
    await persistProfile();
    const otherId = id === 'guilherme' ? 'rayssa' : 'guilherme';
    AppState.otherProfile = await FluentrData.ensureProfile(otherId);
    await FluentrData.updateCouple((c) => {
      ensureDailyCoupleChallenge(c);
      FluentrGamification.computeCoupleStreak(c, AppState.profile, AppState.otherProfile);
      FluentrGamification.finalizeWeekIfNeeded(c, AppState.profile, AppState.otherProfile);
    });
    AppState.couple = await FluentrData.getCouple();

    if (!AppState.profile.onboarded) {
      AppState.screen = 'onboard-goal';
      render();
      return;
    }
    checkStreakReminder();
    enterApp();
  }

  function checkStreakReminder() {
    const p = AppState.profile;
    if (!p.settings.notifyStreak) return;
    const hour = new Date().getHours();
    const doneToday = (p.history || []).some((h) => h.date === flTodayISO());
    if (p.streak.current > 0 && !doneToday && hour >= 18) {
      FluentrPWA.maybeNotify(p.id, `Don't lose your ${p.streak.current}-day streak 🔥`, 'One quick lesson keeps it alive today.');
    }
  }

  // Mutates the couple doc in place — must run INSIDE an updateCouple()
  // mutator (see enterProfile) so the rotation actually persists. It used
  // to mutate a separate AppState.couple copy that a later getCouple()
  // call would immediately discard, so the daily challenge never rotated
  // past day one in practice.
  function ensureDailyCoupleChallenge(c) {
    const today = flTodayISO();
    if (c.dailyChallenge.date !== today) {
      const item = FluentrLessonEngine.dailyCoupleChallengeFor(today);
      c.dailyChallenge = { date: today, exerciseId: item.id, completions: {} };
    }
  }

  function enterApp() {
    AppState.screen = 'app';
    FluentrRouter.register('home', () => setRoute('home'));
    FluentrRouter.register('learn', () => setRoute('learn'));
    FluentrRouter.register('practice', () => setRoute('practice'));
    FluentrRouter.register('league', () => setRoute('league'));
    FluentrRouter.register('profile', () => setRoute('profile'));
    FluentrRouter.register('progress', () => setRoute('progress'));
    FluentrRouter.register('badges', () => setRoute('badges'));
    FluentrRouter.register('settings', () => setRoute('settings'));
    FluentrRouter.register('phrasebook', () => setRoute('phrasebook'));
    FluentrRouter.register('traps', () => setRoute('traps'));
    FluentrRouter.register('sos', () => setRoute('sos'));
    FluentrRouter.register('say', () => setRoute('say'));
    FluentrRouter.register('writing', () => setRoute('writing'));
    FluentrRouter.register('technical', () => setRoute('technical'));
    FluentrRouter.register('duel-setup', () => setRoute('duel-setup'));
    FluentrRouter.register('comeback', () => setRoute('comeback'));
    FluentrRouter.register('ai-chat', () => setRoute('ai-chat'));
    FluentrRouter.register('ai-writing', () => setRoute('ai-writing'));
    FluentrRouter.start(() => {});
    FluentrRouter.render();
    startLiveSync();
    FluentrPresence.start(AppState.profile.id, () => {
      if (AppState.screen === 'app' && AppState.route === 'league') render();
    });
  }

  // Screens where the partner's activity is actually visible — only these
  // are worth re-rendering on a live update. Deliberately excludes any
  // mid-exercise screen: re-rendering under someone answering a question
  // would wipe their selection, and their own next answer refreshes this
  // state anyway.
  const LIVE_REFRESH_ROUTES = ['home', 'league', 'practice', 'progress', 'comeback'];

  // Without this, switching profiles (case 'switch-profile' below) left
  // AppState.unsubscribeLive set from the OLD session — startLiveSync()'s
  // guard would then skip resubscribing for the new profile entirely,
  // silently killing live sync for the rest of that session.
  function stopLiveSync() {
    if (AppState.unsubscribeLive) { AppState.unsubscribeLive(); AppState.unsubscribeLive = null; }
    FluentrPresence.stop();
  }

  function startLiveSync() {
    if (AppState.unsubscribeLive) return;
    AppState.unsubscribeLive = FluentrData.subscribeToChanges(async () => {
      if (AppState.screen !== 'app' || !LIVE_REFRESH_ROUTES.includes(AppState.route)) return;
      const before = AppState.otherProfile ? FluentrGamification.buildStats(AppState.otherProfile).weeklyXP : 0;
      const otherId = AppState.profile.id === 'guilherme' ? 'rayssa' : 'guilherme';
      const [mine, theirs, couple] = await Promise.all([
        FluentrData.getProfile(AppState.profile.id),
        FluentrData.ensureProfile(otherId),
        FluentrData.getCouple()
      ]);
      AppState.profile = mine;
      AppState.otherProfile = theirs;
      AppState.couple = couple;
      const after = FluentrGamification.buildStats(AppState.otherProfile).weeklyXP;
      if (after > before) {
        FluentrUI.showToast(`${AppState.otherProfile.name} just earned ${after - before} XP`, 'Live from their device.', 'competitive');
      }
      render();
    });
  }

  function setRoute(name) {
    AppState.screen = 'app';
    AppState.route = name;
    if (name === 'say') { AppState.say = { query: '', results: null }; }
    if (name === 'sos') AppState.sos = { view: 'hub' };
    if (name === 'settings') loadSettingsBackups();
    render();
  }

  // Fire-and-forget: renders without the Cloud Backups card first (or
  // whatever it last showed), then re-renders once the list arrives —
  // avoids blocking the whole Settings screen on a network round trip.
  function loadSettingsBackups() {
    if (!FluentrData.listBackups) return;
    FluentrData.listBackups().then((backups) => {
      AppState.settingsBackups = backups;
      if (AppState.route === 'settings') render();
    }).catch(() => { });
  }

  function applyTheme(theme) {
    // Always set the attribute explicitly (never just remove it) — tokens.css
    // has a `prefers-color-scheme: light` fallback for first paint before this
    // runs, guarded by `:not([data-theme="dark"])`. If dark is applied by
    // removing the attribute instead of setting it, that fallback overrides
    // the app's own dark default whenever the OS prefers light.
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
  }

  /* ============ Render ============ */

  function render() {
    if (AppState.screen === 'gate') return; // already rendered
    if (AppState.screen === 'onboard-goal') { shellEl.innerHTML = FluentrUI.renderOnboardingGoal(AppState.profile); return; }
    if (AppState.screen === 'onboard-placement-choice') { shellEl.innerHTML = FluentrUI.renderOnboardingPlacementChoice(AppState.profile); return; }
    if (AppState.screen === 'placement') { shellEl.innerHTML = renderPlacementScreen(); return; }
    if (AppState.screen === 'session') { shellEl.innerHTML = wrapApp(renderSessionScreen()); return; }
    if (AppState.screen === 'out-of-hearts') { shellEl.innerHTML = wrapApp(FluentrUI.renderOutOfHearts()); return; }
    if (AppState.screen === 'simulator') { shellEl.innerHTML = wrapApp(renderSimulatorScreen()); return; }
    if (AppState.screen === 'duel') { shellEl.innerHTML = wrapApp(renderDuelScreen()); return; }
    if (AppState.screen === 'week-recap') { shellEl.innerHTML = wrapApp(FluentrUI.renderWeekRecap(FluentrLessonEngine.buildWeeklyRecap(AppState.profile))); return; }

    shellEl.innerHTML = wrapApp(renderRoute());
    if (AppState.route === 'ai-chat') {
      const scroller = document.getElementById('ai-chat-scroll');
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    }
  }

  function wrapApp(innerHTML) {
    return `${FluentrUI.renderRail(AppState.profile, AppState.route)}
      <div class="main-col">
        ${FluentrUI.renderTopbar(AppState.route)}
        <main id="view-root">${innerHTML}</main>
        ${FluentrUI.renderBottomNav(AppState.route)}
      </div>`;
  }

  function renderRoute() {
    const p = AppState.profile, op = AppState.otherProfile, c = AppState.couple;
    switch (AppState.route) {
      case 'home': return FluentrUI.renderHome(p, op, c);
      case 'learn': return FluentrUI.renderLearn(p);
      case 'practice': return FluentrUI.renderPractice(p);
      case 'traps': return FluentrUI.renderTraps(p, AppState.traps.filter);
      case 'sos': return renderSOSRoute();
      case 'say': return AppState.say.openId ? FluentrUI.renderSayDetail(window.WL_DATA.say.find((s) => s.id === AppState.say.openId)) : FluentrUI.renderSay(p, AppState.say.query, AppState.say.results);
      case 'writing': return AppState.writing.openId ? FluentrUI.renderWritingDetail(window.WL_DATA.writing.find((w) => w.id === AppState.writing.openId), AppState.writing.tone) : FluentrUI.renderWriting(p);
      case 'technical': return AppState.technical.openId ? FluentrUI.renderTechnicalDetail(window.WL_DATA.technical.find((t) => t.id === AppState.technical.openId), AppState.technical.audience) : FluentrUI.renderTechnical(p);
      case 'ai-chat': return AppState.aiChat.scenario ? FluentrUI.renderAIChat(AppState.aiChat) : FluentrUI.renderAIChatSetup();
      case 'ai-writing': return FluentrUI.renderAIWriting(AppState.aiWriting);
      case 'league': return FluentrUI.renderLeague(p, op, c);
      case 'comeback': return FluentrUI.renderComeback(FluentrGamification.buildStats(p), FluentrGamification.buildStats(op), op);
      case 'duel-setup': return FluentrUI.renderDuelSetup();
      case 'badges': return FluentrUI.renderBadges(p);
      case 'profile': return FluentrUI.renderProfile(p, op);
      case 'progress': return FluentrUI.renderProgress(p);
      case 'phrasebook': return FluentrUI.renderPhrasebook(p);
      case 'settings': return FluentrUI.renderSettings({ theme: FluentrData.getTheme(), notifyPermission: FluentrPWA.notificationPermission(), pushSupported: FluentrPush.isSupported() && FluentrAI.isEnabled(), installState: FluentrPWA.installState(), backups: AppState.settingsBackups, sfxEnabled: FluentrSFX.isEnabled() }, p);
      default: return FluentrUI.renderHome(p, op, c);
    }
  }

  function renderSOSRoute() {
    const s = AppState.sos;
    if (s.view === 'pack') return FluentrUI.renderSOSPack(window.WL_DATA.sos.packs.find((x) => x.id === s.packId));
    if (s.view === 'interview-hub') return FluentrUI.renderSOSInterviewHub();
    if (s.view === 'interview-cat') return FluentrUI.renderSOSInterviewCategory(window.WL_DATA.sos.interview.categories.find((c) => c.id === s.catId));
    return FluentrUI.renderSOSHub();
  }

  /* ============ Session player (Learn path / Review / Quick / Recovery) ============ */

  function initItemState(item) {
    if (item.type === 'reorder') return { answered: false, bankIndices: FluentrLessonEngine.shuffle(item.data.words.map((_, i) => i)), picked: [], correct: false };
    if (item.type === 'translate') return { answered: false, typed: '', correct: false };
    if (item.type === 'match') return { matched: [], selLeft: null, selRight: null, shuffledRight: FluentrLessonEngine.shuffle(item.data.pairs.map((_, i) => i)) };
    return { answered: false, selected: null };
  }

  function startSession(items, mode, meta) {
    if (!items.length) { FluentrUI.showToast('Nothing here yet', null); return; }
    AppState.session = { items, index: 0, mode, meta: meta || {}, correctCount: 0, gradedCount: 0, xpEarned: 0 };
    AppState.itemState = initItemState(items[0]);
    AppState.screen = 'session';
    if (AppState.profile) {
      const rs = AppState.profile.recentlyServed || [];
      AppState.profile.recentlyServed = rs.concat(items.map((it) => it.uid)).slice(-40);
    }
    render();
  }

  function renderSessionScreen() {
    const s = AppState.session;
    if (s.index >= s.items.length) return sessionCompleteHTML();
    return FluentrUI.renderExerciseItem(s.items[s.index], s.index, s.items.length, currentAnswerStateForUI());
  }

  function currentAnswerStateForUI() {
    const st = AppState.itemState;
    if (st.selected !== undefined) return { answered: st.answered, selected: st.selected, xpAwarded: st.xpAwarded };
    return st;
  }

  function sessionCompleteHTML() {
    const s = AppState.session;
    const accuracy = s.gradedCount ? s.correctCount / s.gradedCount : 1;
    if (s.mode === 'lesson' || s.mode === 'challenge') {
      return FluentrUI.renderLessonComplete({ xp: s.xpEarned, accuracy, newPhrases: s.items.length, perfect: accuracy === 1, breakdown: s.xpBreakdown });
    }
    return FluentrUI.renderLessonComplete({ xp: s.xpEarned, accuracy, newPhrases: 0, perfect: accuracy === 1 });
  }

  function gradeAndAdvance(isCorrect) {
    const s = AppState.session, item = s.items[s.index];
    s.gradedCount += 1;
    if (isCorrect) s.correctCount += 1;
    if (isCorrect) FluentrSFX.correct(); else FluentrSFX.incorrect();

    let prevLevel;
    AppState.profile && (prevLevel = FluentrGamification.levelInfo(AppState.profile.xp).level);
    const result = FluentrGamification.recordAnswer(AppState.profile, item.uid, isCorrect, FL_XP_RULES.ANSWER_CORRECT);
    s.xpEarned += result.xpAwarded;
    AppState.itemState.xpAwarded = result.xpAwarded;
    if (isCorrect && item.data.unit) AppState.profile.unitActivity[item.data.unit] = (AppState.profile.unitActivity[item.data.unit] || 0) + 1;

    const isLessonMode = s.mode === 'lesson' || s.mode === 'challenge';
    if (!isCorrect && isLessonMode) {
      FluentrGamification.loseHeart(AppState.profile);
    }
    if (s.mode === 'recovery' && isCorrect) FluentrGamification.gainHeart(AppState.profile, 1);

    settleActivity(prevLevel);

    if (isLessonMode && AppState.profile.hearts.count <= 0) {
      persistProfile();
      AppState.screen = 'out-of-hearts';
      render();
      return;
    }
    render();
  }

  function settleActivity(prevLevel) {
    const streakResult = FluentrGamification.updateStreak(AppState.profile);
    if (streakResult.isFirstActivityToday) FluentrGamification.awardXP(AppState.profile, FL_XP_RULES.FIRST_ACTIVITY_OF_DAY, 'First activity of the day');
    FluentrGamification.addWeeklyXP(AppState.profile, 0); // ensures week bucket exists
    const newLevel = FluentrGamification.levelInfo(AppState.profile.xp).level;
    const unlocked = FluentrGamification.checkBadges(AppState.profile, badgeCtx());
    if (streakResult.usedFreeze) FluentrUI.showToast('🧊 Streak freeze used', `Missed yesterday, but your ${streakResult.current}-day streak survived.`, 'streak');
    else if (streakResult.changed && streakResult.current > 1) FluentrUI.showToast(`🔥 ${streakResult.current}-day streak!`, null, 'streak');
    if (prevLevel && newLevel > prevLevel) { FluentrUI.showLevelUp(newLevel); FluentrSFX.levelUp(); }
    unlocked.forEach((b) => FluentrUI.showToast(`Badge unlocked: ${b.name}`, b.description, 'badge'));
    checkLeagueLeadChange();
    persistProfile();
  }

  // Detects a Couple League lead change (this device's active profile only —
  // a same-device, local-first limitation, see README "Enabling Online Couple
  // Mode") and surfaces it once, persisted on the couple doc so it never repeats.
  function checkLeagueLeadChange() {
    if (!AppState.profile || !AppState.otherProfile || !AppState.couple) return;
    const mine = FluentrGamification.buildStats(AppState.profile).weeklyXP;
    const theirs = FluentrGamification.buildStats(AppState.otherProfile).weeklyXP;
    if (mine === theirs) return;
    const leaderId = mine > theirs ? AppState.profile.id : AppState.otherProfile.id;
    if (AppState.couple.lastLeaderId === leaderId) return;
    const hadPreviousLeader = !!AppState.couple.lastLeaderId;
    AppState.couple.lastLeaderId = leaderId;
    FluentrData.updateCouple((c) => { c.lastLeaderId = leaderId; });
    if (!hadPreviousLeader) return;
    if (leaderId === AppState.profile.id) FluentrUI.showToast('🔥 You just took the lead!', `${Math.abs(mine - theirs)} XP ahead this week.`, 'competitive');
    else FluentrUI.showToast(`👀 ${AppState.otherProfile.name} just passed you`, 'One good lesson could take it back.', 'competitive');
  }

  function finishSession() {
    const s = AppState.session;
    const accuracy = s.gradedCount ? s.correctCount / s.gradedCount : 1;

    if (s.mode === 'lesson' || s.mode === 'challenge') {
      const lessonId = s.meta.lessonId;
      const prog = AppState.profile.pathProgress[lessonId] || { completedCount: 0, bestAccuracy: 0, lastCompletedAt: null };
      const firstTime = prog.completedCount === 0;
      const breakdown = FluentrGamification.computeLessonCompletionXP(AppState.profile, { firstTime, accuracy });
      FluentrGamification.awardXP(AppState.profile, breakdown.total, (s.mode === 'challenge' ? 'Challenge' : 'Lesson') + ' complete');
      s.xpEarned += breakdown.total;
      s.xpBreakdown = breakdown;
      if (firstTime) {
        AppState.profile.counters.lessonsCompleted += 1;
        if (breakdown.perfectBonus > 0) AppState.profile.counters.perfectLessons += 1;
      }
      prog.completedCount += 1; prog.bestAccuracy = Math.max(prog.bestAccuracy, accuracy); prog.lastCompletedAt = new Date().toISOString();
      AppState.profile.pathProgress[lessonId] = prog;
      FluentrGamification.checkBadges(AppState.profile, badgeCtx());
      checkLeagueLeadChange();
    } else if (s.mode === 'sos') {
      // README documents +15 XP for completing an SOS pack warm-up — this was
      // never actually awarded before; per-answer XP still applies on top.
      FluentrGamification.awardXP(AppState.profile, FL_XP_RULES.SOS_COMPLETE, 'SOS warm-up complete');
      s.xpEarned += FL_XP_RULES.SOS_COMPLETE;
      AppState.profile.pillarActivity.sos += 1;
      FluentrGamification.checkBadges(AppState.profile, badgeCtx());
    }
    persistProfile();
    render();
  }

  /* ============ Reorder / Translate / Match helpers ============ */

  function checkReorder() {
    const s = AppState.session, item = s.items[s.index], st = AppState.itemState;
    const built = st.picked.map((wi) => item.data.words[wi]).join(' ');
    const target = item.data.words.join(' ');
    st.correct = built.toLowerCase() === target.toLowerCase();
    st.answered = true;
    gradeAndAdvance(st.correct);
  }

  function normalizeText(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w\s]/g, '').trim().replace(/\s+/g, ' '); }

  function checkTranslate() {
    const input = document.getElementById('translate-input');
    const typed = input ? input.value : '';
    const s = AppState.session, item = s.items[s.index], st = AppState.itemState;
    st.typed = typed;
    const norm = normalizeText(typed);
    st.correct = item.data.accepted.some((a) => normalizeText(a) === norm);
    st.answered = true;
    gradeAndAdvance(st.correct);
  }

  function matchPick(side, i) {
    const st = AppState.itemState, item = AppState.session.items[AppState.session.index];
    if (st.matched.includes(i)) return;
    if (side === 'left') st.selLeft = i; else st.selRight = i;
    if (st.selLeft !== null && st.selRight !== null) {
      if (st.selLeft === st.selRight) { st.matched.push(st.selLeft); }
      st.selLeft = null; st.selRight = null;
    }
    render();
    if (st.matched.length === item.data.pairs.length) {
      // matching has no "incorrect" penalty; count as a correct graded item
      setTimeout(() => gradeAndAdvance(true), 250);
    }
  }

  function nextItem() {
    const s = AppState.session;
    s.index += 1;
    if (s.index >= s.items.length) { finishSession(); render(); return; }
    AppState.itemState = initItemState(s.items[s.index]);
    render();
  }

  function exitSession() {
    AppState.session = null;
    AppState.screen = 'app';
    render();
  }

  /* ============ Simulator player ============ */

  function startSimulator(simId, unitId, lessonId) {
    const sim = window.WL_DATA.simulators[simId];
    if (!sim) return;
    AppState.simulator = { sim, index: 0, answered: false, selected: null, unitId, lessonId };
    AppState.screen = 'simulator';
    render();
  }

  function renderSimulatorScreen() {
    const sm = AppState.simulator;
    return FluentrUI.renderSimulatorStep(sm.sim, sm.index, { answered: sm.answered, selected: sm.selected });
  }

  function simulatorAnswer(idx) {
    const sm = AppState.simulator;
    sm.selected = idx; sm.answered = true;
    const isCorrect = idx === sm.sim.steps[sm.index].answer;
    const prevLevel = FluentrGamification.levelInfo(AppState.profile.xp).level;
    FluentrGamification.awardXP(AppState.profile, isCorrect ? FL_XP_RULES.ANSWER_CORRECT : 1, 'Simulator step');
    settleActivity(prevLevel);
    render();
  }

  function simulatorNext() {
    const sm = AppState.simulator;
    sm.index += 1; sm.answered = false; sm.selected = null;
    if (sm.index >= sm.sim.steps.length) {
      const lessonId = sm.lessonId;
      const prog = AppState.profile.pathProgress[lessonId] || { completedCount: 0, bestAccuracy: 1, lastCompletedAt: null };
      const firstTime = prog.completedCount === 0;
      const bonus = firstTime ? FL_XP_RULES.LESSON_COMPLETE : 8;
      FluentrGamification.awardXP(AppState.profile, bonus, 'Simulation complete');
      prog.completedCount += 1; prog.lastCompletedAt = new Date().toISOString();
      AppState.profile.pathProgress[lessonId] = prog;
      if (firstTime) AppState.profile.counters.lessonsCompleted += 1;
      FluentrGamification.checkBadges(AppState.profile, badgeCtx());
      persistProfile();
    }
    render();
  }

  /* ============ Placement test ============ */

  function startPlacement() {
    const questions = FluentrLessonEngine.shuffle(window.WL_DATA.placement).slice(0, 20);
    AppState.placement = { questions, index: 0, answers: [] };
    AppState.screen = 'placement';
    render();
  }

  function renderPlacementScreen() {
    const p = AppState.placement;
    if (p.index >= p.questions.length) return wrapMinimal(FluentrUI.renderPlacementResult(p.result));
    return wrapMinimal(FluentrUI.renderPlacementQuestion(p.index, p.questions.length, p.questions[p.index]));
  }
  function wrapMinimal(html) { return `<div style="max-width:560px;margin:0 auto;padding:24px 18px;">${html}</div>`; }

  function answerPlacement(idx) {
    const p = AppState.placement, q = p.questions[p.index];
    p.answers.push({ category: q.category, correct: idx === q.answer });
    p.index += 1;
    if (p.index >= p.questions.length) computePlacementResult();
    render();
  }

  function computePlacementResult() {
    const p = AppState.placement;
    const byCategory = {};
    p.answers.forEach((a) => {
      byCategory[a.category] = byCategory[a.category] || { correct: 0, total: 0 };
      byCategory[a.category].total += 1;
      if (a.correct) byCategory[a.category].correct += 1;
    });
    const totalCorrect = p.answers.filter((a) => a.correct).length;
    const ratio = totalCorrect / p.answers.length;
    const level = ratio >= 0.85 ? 'C1' : ratio >= 0.68 ? 'B2' : ratio >= 0.5 ? 'B1' : ratio >= 0.3 ? 'A2' : 'A1';
    p.result = { level, byCategory, total: p.answers.length };
  }

  function finishPlacement() {
    AppState.profile.cefrLevel = AppState.placement.result.level;
    AppState.profile.placementResult = AppState.placement.result;
    AppState.placement = null;
    finishOnboarding();
  }

  function finishOnboarding() {
    AppState.profile.onboarded = true;
    persistProfile();
    enterApp();
  }

  /* ============ Pillars: Traps / Say / Writing / Technical / SOS ============ */

  function markPillarActivity(key, exerciseId, isCorrect) {
    if (isCorrect !== false) FluentrSFX.correct(); else FluentrSFX.incorrect();
    AppState.profile.pillarActivity[key] = (AppState.profile.pillarActivity[key] || 0) + 1;
    const prevLevel = FluentrGamification.levelInfo(AppState.profile.xp).level;
    if (exerciseId) FluentrGamification.recordAnswer(AppState.profile, exerciseId, isCorrect !== false, FL_XP_RULES.ANSWER_CORRECT);
    settleActivity(prevLevel);
  }

  function saveVocabFromScenario(term, meaning, example) {
    if (!term) return;
    const existing = AppState.profile.vocabulary[term] || { seen: 0, correct: 0 };
    AppState.profile.vocabulary[term] = { meaning, example, seen: existing.seen + 1, correct: existing.correct + 1, lastSeen: new Date().toISOString() };
  }

  /* ============ AI Conversation Practice + Writing Coach (V3) ============ */
  // Both talk to Gemini through supabase/functions/ (see js/core/aiClient.js)
  // — the app never holds an AI API key itself. pillarActivity gains two
  // keys here (aiChat/aiWriting) via the same `|| 0` pattern markPillarActivity
  // already uses elsewhere, so old profiles need no migration.

  function awardAIActivity(pillarKey, xpAmount, label) {
    AppState.profile.pillarActivity[pillarKey] = (AppState.profile.pillarActivity[pillarKey] || 0) + 1;
    const prevLevel = FluentrGamification.levelInfo(AppState.profile.xp).level;
    FluentrGamification.awardXP(AppState.profile, xpAmount, label);
    settleActivity(prevLevel);
  }

  function startAIChat(scenario) {
    AppState.aiChat = { scenario, history: [], busy: false, lastCorrection: null, listening: false };
    render();
  }

  function exitAIChat() {
    AppState.aiChat = { scenario: null, history: [], busy: false, lastCorrection: null, listening: false };
    render();
  }

  async function sendAIChatMessage(rawText) {
    const chat = AppState.aiChat;
    const text = (rawText || '').trim();
    if (!text || chat.busy) return;
    chat.history.push({ role: 'user', text });
    chat.busy = true;
    chat.lastCorrection = null;
    render();
    try {
      const priorHistory = chat.history.slice(0, -1);
      const res = await FluentrAI.chat(AppState.profile.id, chat.scenario, AppState.profile.cefrLevel, priorHistory, text);
      chat.history.push({ role: 'model', text: res.reply });
      if (res.hadError) chat.lastCorrection = { correction: res.correction, pt: res.correctionPt };
      awardAIActivity('aiChat', 3, 'AI conversation practice');
    } catch (e) {
      chat.history.push({ role: 'model', text: '⚠️ ' + FluentrAI.friendlyError(e) });
    } finally {
      chat.busy = false;
      render();
    }
  }

  // Web Speech API (Chrome/Edge) — purely browser-side transcription, no
  // server involved. Unsupported browsers (notably Safari/iOS) just don't
  // get a mic button; typing still works everywhere.
  let aiRecognition = null;
  function toggleVoiceInput() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { FluentrUI.showToast('Voice input not supported', 'Try Chrome or Edge on this device.', null); return; }
    const chat = AppState.aiChat;
    if (chat.listening) { if (aiRecognition) aiRecognition.stop(); return; }
    aiRecognition = new SR();
    aiRecognition.lang = 'en-US';
    aiRecognition.interimResults = false;
    aiRecognition.onresult = (e) => { sendAIChatMessage(e.results[0][0].transcript); };
    aiRecognition.onend = () => { AppState.aiChat.listening = false; render(); };
    aiRecognition.onerror = () => { AppState.aiChat.listening = false; render(); };
    chat.listening = true;
    render();
    aiRecognition.start();
  }

  // Infinite personalized content: generates (or pulls from the shared
  // cache — see ai-generate-exercises) a short session targeting whatever
  // unit the profile is currently working through, so it stays relevant
  // without needing a topic picker.
  async function startAIGeneratedSession() {
    if (!FluentrAI.isEnabled()) { FluentrUI.showToast('AI practice needs cloud sync configured', null, null); return; }
    const next = FluentrLessonEngine.findNextLesson(AppState.profile);
    const topic = next ? next.unitName : 'General workplace English';
    FluentrUI.showToast('Generating practice…', topic, null);
    try {
      const res = await FluentrAI.generateExercises(AppState.profile.id, topic, AppState.profile.cefrLevel, 6);
      const items = res.exercises.map((ex) => ({ uid: ex.id, type: ex.type, unit: 'ai-generated', data: ex }));
      startSession(items, 'ai-generated', { topic });
    } catch (e) {
      FluentrUI.showToast('Could not generate practice', FluentrAI.friendlyError(e), null);
    }
  }

  async function reviewWritingText() {
    const w = AppState.aiWriting;
    if (!w.text.trim() || w.busy) return;
    w.busy = true; w.result = null;
    render();
    try {
      w.result = await FluentrAI.reviewWriting(AppState.profile.id, w.text);
      awardAIActivity('aiWriting', 5, 'AI writing review');
    } catch (e) {
      w.result = { issues: [], overallPt: '⚠️ ' + FluentrAI.friendlyError(e) };
    } finally {
      w.busy = false;
      render();
    }
  }

  /* ============ Duel ============ */

  const DUEL_TOPIC_POOLS = {
    business: () => window.WL_DATA.lessons.filter((e) => ['u3', 'u4', 'u8'].includes(e.unit)),
    // Technical English scenarios have no single "correct" register (customer/
    // manager/engineer phrasing are all valid for different audiences), so they
    // can't be scored as multiple-choice — stick to the real Path unit instead
    // of fabricating a fake "answer: 0" that penalized 2 of 3 valid options.
    technical: () => window.WL_DATA.lessons.filter((e) => e.unit === 'u7'),
    traps: () => FluentrLessonEngine.buildSpotBrazilian(20),
    mixed: () => window.WL_DATA.lessons.filter((e) => e.type === 'mc' || e.type === 'fill')
  };

  // Duels are asynchronous: whoever starts one freezes a 10-question set
  // into couple.pendingDuel, plays their own round, and the challenge then
  // waits on the partner's device until they play the *same* questions.
  // The questions are snapshotted (not just their ids) because the Traps
  // topic generates its options on the fly — resolving by id later would
  // hand the second player different distractors.
  async function pickDuelTopic(topic) {
    const pool = DUEL_TOPIC_POOLS[topic]();
    const chosen = FluentrLessonEngine.shuffle(pool).slice(0, 10).map((e) => ({ uid: e.id, data: e }));
    const duel = {
      id: 'duel-' + Date.now(), topic, createdBy: AppState.profile.id,
      createdAt: new Date().toISOString(), exercises: chosen, results: {}, finalized: false
    };
    try {
      AppState.couple = await FluentrData.updateCouple((c) => { c.pendingDuel = duel; });
    } catch (e) {
      FluentrUI.showToast('Could not start the duel', 'Check your connection.', null);
      return;
    }
    startDuelRound(duel);
  }

  // Plays the local half of a pending duel — the same entry point whether
  // you're the one who created it or the one answering the challenge.
  function startDuelRound(pendingDuel) {
    AppState.duel = {
      id: pendingDuel.id, topic: pendingDuel.topic, exercises: pendingDuel.exercises,
      index: 0, answered: false, selected: null, score: 0,
      startedAt: Date.now(), phase: 'play'
    };
    AppState.screen = 'duel';
    render();
  }

  function renderDuelScreen() {
    const d = AppState.duel;
    if (d.phase === 'waiting') return FluentrUI.renderDuelWaiting(d, AppState.profile, AppState.otherProfile);
    if (d.phase === 'result') return FluentrUI.renderDuelResult(d, AppState.profile, AppState.otherProfile);
    return FluentrUI.renderDuelTurn(d, AppState.profile.name, d.index, { answered: d.answered, selected: d.selected });
  }

  function duelAnswer(idx) {
    const d = AppState.duel;
    d.selected = idx; d.answered = true;
    if (idx === d.exercises[d.index].data.answer) { d.score += 1; FluentrSFX.correct(); } else FluentrSFX.incorrect();
    render();
  }

  function duelNextTurnItem() {
    const d = AppState.duel;
    d.index += 1; d.answered = false; d.selected = null;
    if (d.index >= d.exercises.length) {
      submitDuelRound();
      return;
    }
    render();
  }

  // Writes this player's round into the shared pending duel. The finalize
  // transition (both rounds in) happens *inside* the CAS-protected mutator
  // and flips a `finalized` flag, so exactly one device can ever win that
  // race and award the XP — even if both partners happen to finish at the
  // same moment.
  async function submitDuelRound() {
    const d = AppState.duel;
    const myResult = { score: d.score, timeSec: Math.round((Date.now() - d.startedAt) / 1000), at: new Date().toISOString() };
    let finalRecord = null;
    try {
      AppState.couple = await FluentrData.updateCouple((c) => {
        finalRecord = null; // reset: the mutator re-runs on a CAS retry
        const pd = c.pendingDuel;
        if (!pd || pd.id !== d.id) return;
        pd.results[AppState.profile.id] = myResult;
        const ids = Object.keys(pd.results);
        if (ids.length < 2 || pd.finalized) return;
        pd.finalized = true;
        const [aId, bId] = [AppState.profile.id, AppState.otherProfile.id];
        const ra = pd.results[aId], rb = pd.results[bId];
        const winnerId = ra.score !== rb.score ? (ra.score > rb.score ? aId : bId) : (ra.timeSec <= rb.timeSec ? aId : bId);
        finalRecord = {
          id: pd.id, date: flTodayISO(), topic: pd.topic, winnerId,
          results: { [aId]: { score: ra.score, timeSec: ra.timeSec }, [bId]: { score: rb.score, timeSec: rb.timeSec } }
        };
        c.duelHistory = c.duelHistory || [];
        c.duelHistory.unshift(finalRecord);
        if (c.duelHistory.length > 30) c.duelHistory.length = 30;
        c.pendingDuel = null;
      });
    } catch (e) {
      FluentrUI.showToast('Could not submit your round', 'Check your connection.', null);
      return;
    }

    if (!finalRecord) {
      d.phase = 'waiting';
      d.myResult = myResult;
      render();
      FluentrPush.notifyProfile(AppState.otherProfile.id, "It's your turn in the Duel!", `${AppState.profile.name} just played their round — go finish it.`);
      return;
    }
    await awardDuelOutcome(finalRecord);
    d.phase = 'result';
    d.record = finalRecord;
    render();
    // The partner already played earlier and isn't necessarily looking at
    // the app right now — let them know how it turned out too.
    const theyWon = finalRecord.winnerId === AppState.otherProfile.id;
    FluentrPush.notifyProfile(AppState.otherProfile.id, 'Duel finished!', `You ${theyWon ? 'won' : 'lost'} against ${AppState.profile.name}. Check the League for details.`);
  }

  // Runs only on the device that won the finalize race. Both profiles are
  // written through updateProfile (CAS) rather than mutating the local
  // copies, since one of them is the partner's row and may be being
  // written from their device at the same time.
  async function awardDuelOutcome(record) {
    const ids = Object.keys(record.results);
    try {
      for (const id of ids) {
        const updated = await FluentrData.updateProfile(id, (p) => {
          p.counters.duelsPlayed += 1;
          if (record.winnerId === id) {
            p.counters.duelsWon += 1;
            FluentrGamification.awardXP(p, FL_XP_RULES.DUEL_VICTORY, 'Duel victory');
          }
          FluentrGamification.checkBadges(p, badgeCtx());
        });
        if (id === AppState.profile.id) AppState.profile = updated;
        else AppState.otherProfile = updated;
      }
    } catch (e) {
      FluentrUI.showToast('Could not save duel result', 'Check your connection.', null);
    }
  }

  /* ============ Delegated events ============ */

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const a = el.dataset.action;

    switch (a) {
      case 'navigate': FluentrRouter.navigate(el.dataset.route); break;
      case 'pick-profile': enterProfile(el.dataset.id); break;
      case 'pick-goal':
        AppState.profile.goal = el.dataset.goal;
        AppState.screen = 'onboard-placement-choice'; render(); break;
      case 'skip-onboarding': finishOnboarding(); break;
      case 'start-placement': startPlacement(); break;
      case 'pick-level': AppState.profile.cefrLevel = el.dataset.level; finishOnboarding(); break;
      case 'answer-placement': answerPlacement(parseInt(el.dataset.index, 10)); break;
      case 'finish-placement': finishPlacement(); break;
      case 'exit-session': exitSession(); break;

      case 'continue-learning': { const n = FluentrLessonEngine.findNextLesson(AppState.profile); if (n) startLessonOrChallenge(n.unitId, n.lessonId); break; }
      case 'start-lesson': startLessonOrChallenge(el.dataset.unit, el.dataset.lesson); break;
      case 'start-challenge': {
        const unit = window.WL_CURRICULUM.find((u) => u.id === el.dataset.unit);
        if (unit.challenge.kind === 'simulator') startSimulator(unit.challenge.simulatorId, unit.id, unit.challenge.id);
        else startSession(FluentrLessonEngine.buildChallengeSession(unit.id), 'challenge', { lessonId: unit.challenge.id });
        break;
      }
      case 'start-heart-recovery': startSession(FluentrLessonEngine.buildHeartRecovery(), 'recovery', {}); break;
      case 'start-review': startSession(FluentrLessonEngine.buildAdaptiveSession(AppState.profile, 10), 'review', {}); break;
      case 'start-quick': startSession(FluentrLessonEngine.buildQuickStudy(AppState.profile, parseInt(el.dataset.minutes, 10)), 'quick', {}); break;
      case 'catch-up': FluentrRouter.navigate('comeback'); break;
      case 'start-comeback': {
        const otherStats = FluentrGamification.buildStats(AppState.otherProfile);
        const myStats = FluentrGamification.buildStats(AppState.profile);
        const gap = Math.max(FL_XP_RULES.ANSWER_CORRECT * 6, otherStats.weeklyXP - myStats.weeklyXP);
        startSession(FluentrLessonEngine.buildComebackSession(AppState.profile, gap), 'comeback', {});
        break;
      }

      case 'answer-mc': {
        const s = AppState.session, item = s.items[s.index], st = AppState.itemState;
        st.selected = parseInt(el.dataset.index, 10); st.answered = true;
        gradeAndAdvance(st.selected === item.data.answer);
        break;
      }
      case 'reorder-pick': { AppState.itemState.picked.push(parseInt(el.dataset.wi, 10)); AppState.itemState.bankIndices = AppState.itemState.bankIndices.filter((w) => w !== parseInt(el.dataset.wi, 10)); render(); break; }
      case 'reorder-unpick': { const pos = parseInt(el.dataset.pos, 10); const [wi] = AppState.itemState.picked.splice(pos, 1); AppState.itemState.bankIndices.push(wi); render(); break; }
      case 'check-reorder': checkReorder(); break;
      case 'check-translate': checkTranslate(); break;
      case 'match-left': matchPick('left', parseInt(el.dataset.i, 10)); break;
      case 'match-right': matchPick('right', parseInt(el.dataset.i, 10)); break;
      case 'next-item': nextItem(); break;

      case 'filter-traps': AppState.traps.filter = el.dataset.cat; render(); break;
      case 'mark-trap-seen': markPillarActivity('traps', el.dataset.id); persistProfile(); break;
      case 'start-spot-brazilian': startSession(FluentrLessonEngine.buildSpotBrazilian(8).map((q) => ({ uid: q.id + '-spot', type: 'mc', data: q })), 'quick', {}); break;

      case 'open-say': AppState.say.openId = el.dataset.id; render(); break;
      case 'complete-say': {
        const s = window.WL_DATA.say.find((x) => x.id === el.dataset.id);
        saveVocabFromScenario(s.natural, s.situation, s.professional);
        markPillarActivity('say', 'say-' + s.id);
        persistProfile();
        AppState.say = { query: '', results: null };
        FluentrRouter.navigate('say');
        break;
      }
      case 'open-writing': AppState.writing = { openId: el.dataset.id, tone: 'correct' }; render(); break;
      case 'writing-tone': AppState.writing.tone = el.dataset.tone; render(); break;
      case 'complete-writing': {
        markPillarActivity('writing', 'wr-done-' + el.dataset.id);
        persistProfile();
        AppState.writing = { openId: null, tone: 'correct' };
        FluentrRouter.navigate('writing');
        break;
      }
      case 'open-technical': AppState.technical = { openId: el.dataset.id, audience: null }; render(); break;
      case 'tech-audience': AppState.technical.audience = el.dataset.a; render(); break;
      case 'complete-technical': {
        const prevLevel = FluentrGamification.levelInfo(AppState.profile.xp).level;
        AppState.profile.pillarActivity.technical += 1;
        FluentrGamification.awardXP(AppState.profile, FL_XP_RULES.TECHNICAL_SCENARIO, 'Technical scenario');
        settleActivity(prevLevel);
        AppState.technical = { openId: null, audience: null };
        FluentrRouter.navigate('technical');
        break;
      }

      case 'open-sos': AppState.sos = { view: 'pack', packId: el.dataset.id }; render(); break;
      case 'open-sos-interview': AppState.sos = { view: 'interview-hub' }; render(); break;
      case 'open-sos-interview-cat': AppState.sos = { view: 'interview-cat', catId: el.dataset.id }; render(); break;
      case 'start-sos-warmup': {
        const pack = window.WL_DATA.sos.packs.find((p) => p.id === el.dataset.id);
        const items = pack.warmup.map((w, i) => ({ uid: `sos-${pack.id}-${i}`, type: 'mc', data: w }));
        AppState.session = null;
        startSession(items, 'sos', { packId: pack.id });
        break;
      }

      case 'open-couple-challenge': openCoupleChallenge(); break;
      case 'answer-couple': answerCouple(parseInt(el.dataset.index, 10)); break;

      case 'pick-duel-topic': pickDuelTopic(el.dataset.topic); break;
      case 'pick-ai-scenario': startAIChat(el.dataset.scenario); break;
      case 'start-ai-practice': startAIGeneratedSession(); break;
      case 'exit-ai-chat': exitAIChat(); break;
      case 'send-ai-message': {
        const input = document.getElementById('ai-chat-input');
        if (input) { sendAIChatMessage(input.value); input.value = ''; }
        break;
      }
      case 'ai-mic-toggle': toggleVoiceInput(); break;
      case 'review-writing': {
        const ta = document.getElementById('ai-writing-input');
        if (ta) { AppState.aiWriting.text = ta.value; reviewWritingText(); }
        break;
      }
      case 'clear-writing-review': AppState.aiWriting = { text: '', result: null, busy: false }; render(); break;
      case 'play-pending-duel': startDuelRound(AppState.couple.pendingDuel); break;
      case 'cancel-pending-duel':
        if (window.confirm('Cancel this duel? Any round already played is discarded.')) {
          FluentrData.updateCouple((c) => { c.pendingDuel = null; })
            .then((c) => { AppState.couple = c; FluentrRouter.navigate('league'); render(); })
            .catch(() => FluentrUI.showToast('Could not cancel the duel', 'Check your connection.', null));
        }
        break;
      case 'answer-duel': duelAnswer(parseInt(el.dataset.index, 10)); break;
      case 'duel-next-turn': duelNextTurnItem(); break;

      case 'answer-sim': simulatorAnswer(parseInt(el.dataset.index, 10)); break;

      case 'retake-placement': startPlacement(); AppState.screen = 'placement'; render(); break;
      case 'switch-profile': stopLiveSync(); FluentrData.setActiveProfileId(''); showGate(); break;
      case 'toggle-theme': { const t = FluentrData.getTheme() === 'dark' ? 'light' : 'dark'; FluentrData.setTheme(t); applyTheme(t); render(); break; }
      case 'toggle-sfx': { const on = !FluentrSFX.isEnabled(); FluentrSFX.setEnabled(on); if (on) FluentrSFX.correct(); render(); break; }
      case 'toggle-streak-notify': {
        const next = !AppState.profile.settings.notifyStreak;
        if (next) {
          // Real push (reaches the device even with the app fully closed)
          // where supported; falls back to the old in-app-only reminder
          // (core/pwa.js's maybeNotify) otherwise — still better than nothing.
          const subscribePromise = FluentrPush.isSupported() && FluentrAI.isEnabled()
            ? FluentrPush.subscribe(AppState.profile.id).catch(() => false)
            : Promise.resolve(false);
          subscribePromise.then((pushed) => {
            if (pushed) {
              AppState.profile.settings.notifyStreak = true;
              persistProfile(); render();
              return;
            }
            FluentrPWA.requestNotificationPermission().then((perm) => {
              AppState.profile.settings.notifyStreak = perm === 'granted';
              if (perm !== 'granted') FluentrUI.showToast('Notifications blocked', 'Enable them in your browser settings to turn this on.');
              persistProfile(); render();
            });
          });
        } else {
          AppState.profile.settings.notifyStreak = false;
          FluentrPush.unsubscribe().catch(() => { });
          persistProfile(); render();
        }
        break;
      }
      case 'save-daily-goal': {
        const v = Math.max(10, Math.min(200, parseInt(document.getElementById('daily-goal-input').value, 10) || 30));
        AppState.profile.settings.dailyGoalXP = v; persistProfile(); FluentrUI.showToast('Saved', null); render();
        break;
      }
      case 'export-data': exportJSON(FluentrData.exportAll(), 'fluentr-backup'); break;
      case 'export-couple': exportJSON(Promise.resolve(JSON.stringify(AppState.couple, null, 2)), 'fluentr-couple'); break;
      case 'import-data': document.getElementById('import-file-input').click(); break;
      case 'reset-profile':
        if (window.prompt('This cannot be undone. Type RESET to erase ' + AppState.profile.name + '’s progress:') === 'RESET') {
          FluentrData.resetProfile(AppState.profile.id).then(() => enterProfile(AppState.profile.id));
        }
        break;
      case 'reset-all':
        if (window.prompt('This cannot be undone. Type RESET to erase ALL Fluentr data for both profiles:') === 'RESET') {
          FluentrData.resetAll().then(() => { FluentrData.setActiveProfileId(''); showGate(); });
        }
        break;
      case 'restore-backup': {
        if (!window.confirm('Restore this backup? Your current progress will be overwritten with this snapshot.')) break;
        FluentrData.restoreBackup(el.dataset.id).then(() => {
          FluentrUI.showToast('Backup restored', null);
          location.reload();
        }).catch((err) => FluentrUI.showToast('Could not restore backup', FluentrAI.friendlyError(err), null));
        break;
      }
      case 'install-pwa': FluentrPWA.promptInstall(); break;
      case 'upload-photo': document.getElementById('photo-file-input').click(); break;
      case 'remove-photo': AppState.profile.photo = null; persistProfile(); render(); break;
      default: break;
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'import-file-input' && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = async () => {
        try { await FluentrData.importAll(reader.result); FluentrUI.showToast('Progress imported', null); location.reload(); }
        catch (err) { FluentrUI.showToast('Import failed', 'That file did not look like a valid backup.'); }
      };
      reader.readAsText(e.target.files[0]);
    }
    if (e.target && e.target.id === 'photo-file-input' && e.target.files[0]) {
      handlePhotoFile(e.target.files[0]);
    }
    if (e.target && e.target.id === 'photo-posy-input') { persistProfile(); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target && e.target.id === 'ai-chat-input') {
      e.preventDefault();
      sendAIChatMessage(e.target.value);
      e.target.value = '';
    }
  });

  document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'say-search-input') {
      AppState.say.query = e.target.value;
      AppState.say.results = fuzzySearchSay(e.target.value);
      render();
      const input = document.getElementById('say-search-input');
      if (input) { input.focus(); input.selectionStart = input.selectionEnd = input.value.length; }
    }
    if (e.target && e.target.id === 'photo-posy-input') {
      if (AppState.profile.photo) {
        AppState.profile.photo.posY = parseInt(e.target.value, 10);
        const img = document.querySelector('.avatar-edit-wrap .avatar img');
        if (img) img.style.objectPosition = `50% ${AppState.profile.photo.posY}%`;
      }
    }
  });

  /* ============ Profile photo: local resize/crop, no server round-trip ============ */

  function handlePhotoFile(file) {
    if (!file.type || !file.type.startsWith('image/')) { FluentrUI.showToast('Not an image', 'Please choose a photo (JPG, PNG, or similar).'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 480;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2, sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        AppState.profile.photo = { dataUrl: canvas.toDataURL('image/jpeg', 0.85), posY: 50 };
        persistProfile();
        render();
      };
      img.onerror = () => FluentrUI.showToast('Could not read that image', null);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function fuzzySearchSay(query) {
    const q = normalizeText(query);
    if (!q) return null;
    const terms = q.split(' ').filter(Boolean);
    return window.WL_DATA.say.filter((s) => {
      const haystack = normalizeText([s.situation, s.category, (s.tags || []).join(' '), s.simple, s.natural, s.professional].join(' '));
      return terms.every((t) => haystack.includes(t));
    });
  }

  function startLessonOrChallenge(unitId, lessonId) {
    if (AppState.profile.hearts.count <= 0) { AppState.screen = 'out-of-hearts'; render(); return; }
    const unit = window.WL_CURRICULUM.find((u) => u.id === unitId);
    if (unit.challenge.id === lessonId) {
      if (unit.challenge.kind === 'simulator') startSimulator(unit.challenge.simulatorId, unit.id, unit.challenge.id);
      else startSession(FluentrLessonEngine.buildChallengeSession(unit.id), 'challenge', { lessonId });
      return;
    }
    startSession(FluentrLessonEngine.buildLessonSession(unitId, lessonId), 'lesson', { unitId, lessonId });
  }

  function openCoupleChallenge() {
    const item = FluentrLessonEngine.dailyCoupleChallengeFor(AppState.couple.dailyChallenge.date);
    AppState.coupleItem = { item, answered: false, selected: null };
    AppState.screen = 'app';
    AppState.route = '__couple_challenge__';
    shellEl.innerHTML = wrapApp(FluentrUI.renderCoupleChallenge(item, { answered: false, selected: null }));
  }

  async function answerCouple(idx) {
    const ci = AppState.coupleItem;
    ci.answered = true; ci.selected = idx;
    const correct = idx === ci.item.answer;
    if (correct) FluentrSFX.correct(); else FluentrSFX.incorrect();
    const prevLevel = FluentrGamification.levelInfo(AppState.profile.xp).level;
    FluentrGamification.recordAnswer(AppState.profile, 'couple-' + ci.item.id + '-' + AppState.profile.id, correct, FL_XP_RULES.ANSWER_CORRECT);
    settleActivity(prevLevel);

    await FluentrData.updateCouple((c) => {
      c.dailyChallenge.completions[AppState.profile.id] = { correct };
      const both = c.dailyChallenge.completions[AppState.profile.id] && c.dailyChallenge.completions[AppState.otherProfile.id];
      if (both) {
        FluentrGamification.awardXP(AppState.profile, FL_XP_RULES.DAILY_CHALLENGE, 'Daily Couple Challenge');
        AppState.profile.counters.coupleChallengesCompleted += 1;
        const bothPerfect = c.dailyChallenge.completions[AppState.profile.id].correct && c.dailyChallenge.completions[AppState.otherProfile.id].correct;
        FluentrGamification.checkBadges(AppState.profile, badgeCtx({ bothPerfectToday: bothPerfect, coupleStreak: c.streak.current }));
      } else {
        FluentrPush.notifyProfile(AppState.otherProfile.id, `${AppState.profile.name} completed today's challenge!`, "Your turn — answer it before the day ends.");
      }
    });
    AppState.couple = await FluentrData.getCouple();
    persistProfile();
    shellEl.innerHTML = wrapApp(FluentrUI.renderCoupleChallenge(ci.item, { answered: true, selected: idx }));
  }

  async function exportJSON(jsonPromise, filenamePrefix) {
    const json = await jsonPromise;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filenamePrefix}-${flTodayISO()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  document.addEventListener('DOMContentLoaded', boot);

  return { currentHearts: () => currentHearts() };
})();
