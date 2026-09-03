/* FLUENTR — ui.js
   Icon set, shared components, and every page render function. Functions
   return HTML strings; app.js wires interactivity via delegated
   [data-action] click handlers. */

const FluentrIcons = (function () {
  const paths = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
    learn: '<path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0 0 4h14"/>',
    practice: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    league: '<path d="m14.5 6-3-3-3 3M11.5 3v9M6 13l-3 3 3 3M3 16h9M18 13l3 3-3 3M21 16h-9"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
    plane: '<path d="M10.5 21 12 17l1.5 4M2 12l20-7-7 20-3-8-8-3-2-2Z"/>',
    'trending-up': '<path d="M3 17 9 11l4 4 8-8M17 7h4v4"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M12 15h5"/>',
    spark: '<path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 6 8 7 8-7"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17.5" cy="9" r="2.6"/><path d="M14.8 12.6A4.6 4.6 0 0 1 20.5 19"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2.6-2.6 2.8-2.8Z"/>',
    cloud: '<path d="M7 18a4.5 4.5 0 0 1-.7-8.94A5.5 5.5 0 0 1 17.4 8.02 4 4 0 0 1 17 18H7Z"/>',
    alert: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/>',
    languages: '<path d="M3 5h9M7 3v2M6 8a12 12 0 0 0 6 6M12 8a12 12 0 0 1-8 8M13 21l4-9 4 9M14.5 18h5"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17Z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 21v-4M9 21h6"/>',
    trophy: '<path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 5H5a3 3 0 0 0 3 5"/><path d="M16 5h3a3 3 0 0 1-3 5"/><path d="M12 13v3M9 20h6M10 20v-3.5M14 20v-3.5"/>',
    heart: '<path d="M12 20s-7.5-4.7-9.5-9.3C1 7 3 4 6.3 4c2 0 3.2 1 5.7 3.5C14.5 5 15.7 4 17.7 4 21 4 23 7 21.5 10.7 19.5 15.3 12 20 12 20Z"/>',
    message: '<rect x="3" y="5" width="18" height="12" rx="4"/><path d="M8 21l4-4 4 4"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    phone: '<path d="M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z"/>',
    chat: '<path d="M4 5h13a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H9l-5 4V5Z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chevronRight: '<path d="m9 6 6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    flame: '<path d="M12 2s-6 6-6 11a6 6 0 0 0 12 0c0-1.5-.6-2.6-1.2-3.6.1 1.4-.6 2.3-1.3 2.3-1 0-1-1-1-2 0-2-1-3.5-2.5-4.7.3 1.5-1 2.5-1 5C11 12 12 2 12 2Z"/>',
    footprints: '<ellipse cx="8" cy="7" rx="2.3" ry="3"/><ellipse cx="16" cy="15" rx="2.3" ry="3"/><path d="M6 12v2M18 20v2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    download: '<path d="M12 3v13m0 0-4-4m4 4 4-4"/><path d="M4 21h16"/>',
    upload: '<path d="M12 21V8m0 0-4 4m4-4 4 4"/><path d="M4 3h16"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    swords: '<path d="m14.5 17.5 3 3L21 17l-3-3M3 21l7-7M14.5 6.5l-9-4-1.5 1.5 4 9M14.5 6.5 21 3l-3.5 6.5M14.5 6.5l-8 8"/>',
    crown: '<path d="M3 8l4 3 5-6 5 6 4-3-2 11H5L3 8Z"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>'
  };

  function icon(name, size, sw) {
    const d = paths[name] || paths.target;
    const s = size || 18, w = sw || 1.9;
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  }
  return { icon };
})();

const FluentrUI = (function () {

  function esc(str) { const d = document.createElement('div'); d.textContent = str == null ? '' : String(str); return d.innerHTML; }
  function pct(n) { return Math.round(n * 100) + '%'; }
  function initials(name) { return (name || '?').trim().charAt(0).toUpperCase(); }

  function avatar(profile, size) {
    size = size || 40;
    if (profile.photo && profile.photo.dataUrl) {
      const posY = profile.photo.posY != null ? profile.photo.posY : 50;
      return `<div class="avatar" style="width:${size}px;height:${size}px;overflow:hidden;padding:0;"><img src="${profile.photo.dataUrl}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:50% ${posY}%;display:block;"></div>`;
    }
    return `<div class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.4)}px;background:${profile.color};">${initials(profile.name)}</div>`;
  }

  function xpRing(progress, size, strokeW, centerHTML) {
    size = size || 60; strokeW = strokeW || 6;
    const r = (size - strokeW) / 2, c = 2 * Math.PI * r;
    const offset = c * (1 - Math.max(0, Math.min(1, progress)));
    return `<div class="xp-ring" style="width:${size}px;height:${size}px;">
      <svg width="${size}" height="${size}">
        <circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${strokeW}"></circle>
        <circle class="ring-fill" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${strokeW}" stroke-dasharray="${c}" stroke-dashoffset="${offset}"></circle>
      </svg>
      <div class="ring-center">${centerHTML || ''}</div>
    </div>`;
  }

  function heartsRow(count, max) {
    max = max || 5;
    let html = '<span class="hearts-row">';
    for (let i = 0; i < max; i++) html += `<span class="heart-icon ${i < count ? '' : 'empty'}">${FluentrIcons.icon('heart', 16, i < count ? 0 : 1.6)}</span>`;
    return html + '</span>';
  }

  function timeAgo(iso) {
    if (!iso) return 'not yet';
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (days <= 0) return 'today'; if (days === 1) return 'yesterday'; if (days < 7) return days + 'd ago';
    return Math.floor(days / 7) + 'w ago';
  }

  /* ============ Layout ============ */

  const NAV_ITEMS = [
    { route: 'home', label: 'Home', icon: 'home' },
    { route: 'learn', label: 'Learn', icon: 'learn' },
    { route: 'practice', label: 'Practice', icon: 'practice' },
    { route: 'league', label: 'League', icon: 'league' },
    { route: 'profile', label: 'Profile', icon: 'user' }
  ];

  function renderRail(profile, activeRoute) {
    const items = NAV_ITEMS.map((n) => `
      <button class="rail-item ${activeRoute === n.route ? 'active' : ''}" data-action="navigate" data-route="${n.route}">
        ${FluentrIcons.icon(n.icon, 18)}<span>${n.label}</span>
      </button>`).join('');
    return `<aside class="rail">
      <div class="rail-brand">${FluentrIcons.icon('spark', 20)}<span>FLUENTR</span></div>
      <div>${items}</div>
      <div class="rail-footer">
        <div class="rail-profile" data-action="navigate" data-route="profile">
          ${avatar(profile, 36)}
          <div><div style="font-weight:700;font-size:13px;">${esc(profile.name)}</div><div style="font-size:11.5px;color:var(--ink-faint);">Level ${FluentrGamification.buildStats(profile).level}</div></div>
        </div>
      </div>
    </aside>`;
  }

  function renderTopbar(activeRoute) {
    const label = (NAV_ITEMS.find((n) => n.route === activeRoute) || {}).label || 'Fluentr';
    return `<header class="topbar">
      <div class="topbar-brand">${FluentrIcons.icon('spark', 18)}FLUENTR</div>
      <span class="text-faint" style="font-size:13px;font-weight:700;">${label}</span>
    </header>`;
  }

  function renderBottomNav(activeRoute) {
    const items = NAV_ITEMS.map((n) => `
      <button class="bottom-nav-item ${activeRoute === n.route ? 'active' : ''}" data-action="navigate" data-route="${n.route}">
        ${FluentrIcons.icon(n.icon, 21)}<span>${n.label}</span>
      </button>`).join('');
    return `<nav class="bottom-nav">${items}</nav>`;
  }

  /* ============ Profile gate & onboarding ============ */

  function renderProfileGate(existingIds) {
    const cards = FL_KNOWN_PROFILES.map((p) => `
      <button class="profile-pick-card" data-action="pick-profile" data-id="${p.id}">
        <div class="avatar profile-pick-avatar" style="background:${p.color};">${initials(p.name)}</div>
        <div class="profile-pick-name">${p.name}</div>
        <div class="profile-pick-sub">${existingIds.includes(p.id) ? 'Continue' : 'New profile'}</div>
      </button>`).join('');
    const flu = FluentrMascot.avatar(existingIds.length ? 'welcome-back' : 'idle', 84);
    return `<div class="profile-gate">
      <div>${flu}</div>
      <div class="gate-logo">${FluentrIcons.icon('spark', 26)}FLUENTR</div>
      <div class="gate-tagline">English you can actually use.</div>
      <div>
        <div class="page-eyebrow text-faint" style="margin-bottom:14px;font-weight:700;font-size:12.5px;text-transform:uppercase;letter-spacing:.06em;">Who's learning?</div>
        <div class="profile-pick-grid">${cards}</div>
      </div>
    </div>`;
  }

  function renderAuthGate(sentTo) {
    const flu = FluentrMascot.avatar('idle', 84);
    if (sentTo) {
      return `<div class="profile-gate">
        <div>${flu}</div>
        <div class="gate-logo">${FluentrIcons.icon('spark', 26)}FLUENTR</div>
        <h2 style="font-size:19px;margin-top:6px;">Check your email</h2>
        <p class="text-soft" style="text-align:center;max-width:280px;">We sent a sign-in link to <strong>${esc(sentTo)}</strong>. Open it on this device to continue.</p>
        <button class="btn btn-ghost btn-sm" data-action="auth-try-again">Use a different email</button>
      </div>`;
    }
    return `<div class="profile-gate">
      <div>${flu}</div>
      <div class="gate-logo">${FluentrIcons.icon('spark', 26)}FLUENTR</div>
      <div class="gate-tagline">English you can actually use.</div>
      <div style="width:100%;max-width:300px;">
        <div class="form-row"><label class="form-label">Your email</label><input type="email" class="form-input" id="auth-email-input" placeholder="you@example.com" autocomplete="email"></div>
        <button class="btn btn-primary btn-block mt-8" data-action="send-magic-link">Send sign-in link</button>
        <div id="auth-error" class="text-faint" style="color:var(--danger);font-size:12.5px;margin-top:8px;text-align:center;"></div>
      </div>
    </div>`;
  }

  function renderClaimGate(unclaimedIds) {
    const cards = FL_KNOWN_PROFILES.filter((p) => unclaimedIds.includes(p.id)).map((p) => `
      <button class="profile-pick-card" data-action="claim-profile" data-id="${p.id}">
        <div class="avatar profile-pick-avatar" style="background:${p.color};">${initials(p.name)}</div>
        <div class="profile-pick-name">${p.name}</div>
        <div class="profile-pick-sub">This is me</div>
      </button>`).join('');
    return `<div class="profile-gate">
      <div>${FluentrMascot.avatar('welcome-back', 84)}</div>
      <div class="gate-logo">${FluentrIcons.icon('spark', 26)}FLUENTR</div>
      <div class="page-eyebrow text-faint" style="margin-bottom:14px;font-weight:700;font-size:12.5px;text-transform:uppercase;letter-spacing:.06em;">Which one of you is this?</div>
      <div class="profile-pick-grid">${cards || '<div class="text-soft">Both profiles are already claimed by other accounts.</div>'}</div>
    </div>`;
  }

  function renderOnboardingGoal(profile) {
    const options = FL_GOAL_OPTIONS.map((g) => `
      <button class="onboard-option" data-action="pick-goal" data-goal="${g.id}">${esc(g.label)}</button>`).join('');
    return `<div class="profile-gate">
      <div>${avatar(profile, 56)}</div>
      <h2 style="font-size:20px;">Hi ${esc(profile.name)}! What's your main goal?</h2>
      <div class="onboard-options">${options}</div>
      <button class="btn btn-ghost btn-sm" data-action="skip-onboarding">Skip for now</button>
    </div>`;
  }

  function renderOnboardingPlacementChoice(profile) {
    return `<div class="profile-gate">
      <h2 style="font-size:20px;">Do you know your English level?</h2>
      <p class="text-soft" style="max-width:34ch;">Take a quick 20-question placement test, or tell us yourself.</p>
      <div class="onboard-options">
        <button class="btn btn-primary btn-block" data-action="start-placement">Take a quick placement test</button>
        <button class="onboard-option" data-action="pick-level" data-level="A1">A1 — Beginner</button>
        <button class="onboard-option" data-action="pick-level" data-level="A2">A2 — Elementary</button>
        <button class="onboard-option" data-action="pick-level" data-level="B1">B1 — Intermediate</button>
        <button class="onboard-option" data-action="pick-level" data-level="B2">B2 — Upper-Intermediate</button>
        <button class="onboard-option" data-action="pick-level" data-level="C1">C1 — Advanced</button>
      </div>
    </div>`;
  }

  /* ============ Placement test ============ */

  function renderPlacementQuestion(index, total, q) {
    const options = q.options.map((opt, i) => `<button class="option-btn" data-action="answer-placement" data-index="${i}">${esc(opt)}</button>`).join('');
    return `
      ${index === 0 ? FluentrMascot.bubble('thinking', "No pressure — just answer with your gut instinct.", 44) : ''}
      <div class="session-header">
        <button class="icon-btn" data-action="exit-session" aria-label="Exit exercise" type="button">${FluentrIcons.icon('x', 17)}</button>
        <div class="session-progress-track"><div class="session-progress-fill" style="width:${Math.round((index / total) * 100)}%;"></div></div>
        <span class="text-faint mono" style="font-size:12px;">${index + 1}/${total}</span>
      </div>
      <div class="exercise-card">
        <div class="exercise-meta"><span class="chip chip-brand">${esc(q.category)}</span><span class="chip">${esc(q.level)}</span></div>
        <div class="exercise-question">${esc(q.question)}</div>
        <div class="option-list">${options}</div>
      </div>`;
  }

  function renderPlacementResult(result) {
    const rows = Object.entries(result.byCategory).map(([cat, v]) => `
      <div class="skill-score-row"><div class="skill-score-head"><span>${esc(cat)}</span><span>${pct(v.correct / v.total)}</span></div>
      <div class="goal-bar-track"><div class="goal-bar-fill" style="width:${pct(v.correct / v.total)};"></div></div></div>`).join('');
    return `
      <div class="complete-card">
        <div class="level-result-badge"><span class="lvl">${result.level}</span><span class="lvl-label">${FL_CEFR_LABELS[result.level]}</span></div>
        <h2 style="font-size:19px;margin-bottom:4px;">Your estimated level</h2>
        <p class="text-soft" style="margin-bottom:22px;">Based on ${result.total} questions across four categories.</p>
        <div style="text-align:left;">${rows}</div>
        <button class="btn btn-primary btn-block mt-16" data-action="finish-placement">Continue</button>
      </div>`;
  }

  /* ============ Boot skeleton ============ */

  function renderBootSkeleton() {
    return `<div class="boot-skeleton">
      <div class="boot-skeleton-logo">${FluentrIcons.icon('spark', 22)} FLUENTR</div>
      <div style="width:180px;display:flex;flex-direction:column;gap:8px;">
        <div class="skeleton-bar" style="width:100%;"></div>
        <div class="skeleton-bar" style="width:70%;"></div>
      </div>
    </div>`;
  }

  /* ============ Home ============ */

  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning'; if (h < 18) return 'Good afternoon'; return 'Good evening';
  }

  function leagueSplitPct(a, b) {
    const total = a + b;
    return total > 0 ? a / total : 0.5;
  }

  function homeMascotState(stats, todayXP, goal) {
    const hour = new Date().getHours();
    if (stats.currentStreak > 0 && todayXP < goal && hour >= 19) return { state: 'streak-danger', msg: `Don't lose your ${stats.currentStreak}-day streak — a few XP will do it! 🔥` };
    if (todayXP >= goal) return { state: 'proud', msg: "Today's goal is done. I'm proud of you! ✨" };
    if (stats.currentStreak === 0) return { state: 'idle', msg: "Ready when you are — let's start a streak today." };
    return { state: 'happy', msg: `${stats.currentStreak} days strong. Let's keep it going!` };
  }

  function renderHome(profile, otherProfile, couple) {
    const stats = FluentrGamification.buildStats(profile);
    const goal = profile.settings.dailyGoalXP;
    const todayXP = (profile.history || []).filter((h) => h.date === flTodayISO()).reduce((a, h) => a + h.xp, 0);
    const goalPct = Math.min(1, todayXP / goal);
    const otherStats = FluentrGamification.buildStats(otherProfile);
    const diff = otherStats.weeklyXP - stats.weeklyXP;
    const flu = homeMascotState(stats, todayXP, goal);

    const remaining = Math.max(0, goal - todayXP);
    const proximityNote = todayXP >= goal ? "Today's goal is complete ✨" : remaining <= 8 ? `Just ${remaining} XP away.` : null;

    const leagueNote = diff > 0
      ? (diff <= 30 ? `${esc(otherProfile.name)} is ahead by ${diff} XP — one lesson could change the lead. 😏` : `${esc(otherProfile.name)} is ahead by ${diff} XP 😏`)
      : diff < 0 ? `You just took the lead by ${-diff} XP 🔥` : "It's a tie — keep going! 👀";

    return `
      <div class="hero">
        ${FluentrMascot.bubble(flu.state, esc(flu.msg), 48)}
        <div class="hero-greeting">${greeting()}, ${esc(profile.name)}.</div>
        <div class="hero-sub">${stats.currentStreak > 0 ? `🔥 ${stats.currentStreak} day streak` : 'Start a streak today'}</div>
        <div class="hero-goal-row"><span class="hero-goal-label">Today's goal</span><span class="hero-goal-value">${todayXP} / ${goal} XP</span></div>
        <div class="goal-bar-track"><div class="goal-bar-fill" style="width:${pct(goalPct)};"></div></div>
        ${proximityNote ? `<div style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.85);margin-top:8px;">${esc(proximityNote)}</div>` : ''}
        <div class="hero-cta"><button class="btn btn-block" style="background:#fff;color:var(--brand-strong);" data-action="continue-learning">Continue Lesson</button></div>
      </div>

      <div class="league-card">
        <div class="league-head"><span class="league-title">${FluentrIcons.icon('league', 14)} Couple League</span>${couple.streak.current > 0 ? `<span class="chip chip-couple">❤️🔥 ${couple.streak.current}</span>` : ''}</div>
        <div class="league-vs">
          <div class="league-side">${avatar(profile, 46)}<div class="league-name mt-8">${esc(profile.name)}</div><div class="league-xp">${stats.weeklyXP} XP</div></div>
          <div class="league-vs-divider">VS</div>
          <div class="league-side">${avatar(otherProfile, 46)}<div class="league-name mt-8">${esc(otherProfile.name)}</div><div class="league-xp">${otherStats.weeklyXP} XP</div></div>
        </div>
        <div class="league-bar-track"><div class="league-bar-a" style="width:${pct(leagueSplitPct(stats.weeklyXP, otherStats.weeklyXP))};"></div><div class="league-bar-b" style="flex:1;"></div></div>
        <div class="league-note">${leagueNote}</div>
        ${diff > 0 ? `<button class="btn btn-couple btn-block mt-16" data-action="catch-up">Catch Up</button>` : `<button class="btn btn-subtle btn-block mt-16" data-action="navigate" data-route="league">View League</button>`}
      </div>

      <div class="pillar-grid">
        ${pillarCard('sos', 'English SOS', 'I need it now', 'bolt', 'var(--streak)', 'var(--streak-soft)')}
        ${pillarCard('say', 'What Should I Say?', 'Real situations', 'message', 'var(--brand)', 'var(--brand-soft)')}
        ${pillarCard('traps', 'Brazilian Traps', 'Stop translating', 'languages', 'var(--couple)', 'var(--couple-soft)')}
        ${pillarCard('writing', 'Write Better', 'Messages & email', 'mail', 'var(--success)', 'var(--success-soft)')}
        ${pillarCard('technical', 'Technical English', 'For devs & tech teams', 'terminal', 'var(--info)', 'var(--info-soft)')}
      </div>

      <div class="section">
        <div class="section-head"><span class="section-title">Continue your journey</span><button class="section-link" data-action="navigate" data-route="learn">See all →</button></div>
        <div class="card">${nextLessonPreview(profile)}</div>
      </div>
    `;
  }

  /* ============ Comeback / Catch Up ============ */

  function renderComeback(myStats, otherStats, otherProfile) {
    const gap = Math.max(0, otherStats.weeklyXP - myStats.weeklyXP);
    const suggestions = [
      { name: 'English SOS', sub: 'Quick warm-up · 3 questions', icon: 'bolt', color: 'var(--streak)', xp: 15, min: 4, route: 'sos' },
      { name: 'What Should I Say?', sub: 'One real-life scenario', icon: 'message', color: 'var(--brand)', xp: 5, min: 3, route: 'say' },
      { name: 'Technical English', sub: 'One "explain it to..." scenario', icon: 'terminal', color: 'var(--info)', xp: 20, min: 3, route: 'technical' },
      { name: 'Quick Practice', sub: '6 mixed questions', icon: 'target', color: 'var(--success)', xp: 30, min: 5, route: null }
    ];
    const totalPossible = suggestions.reduce((a, s) => a + s.xp, 0);
    const cards = suggestions.map((s) => `
      <div class="comeback-suggestion">
        <div class="flex gap-8" style="align-items:center;">
          <div class="pillar-icon" style="background:${s.color}22;color:${s.color};">${FluentrIcons.icon(s.icon, 16)}</div>
          <div><div class="comeback-suggestion-name">${esc(s.name)}</div><div class="comeback-suggestion-meta">~${s.min} min</div></div>
        </div>
        <div class="flex gap-8" style="align-items:center;">
          <span class="comeback-suggestion-xp">+${s.xp} XP</span>
          ${s.route ? `<button class="icon-btn" data-action="navigate" data-route="${s.route}" aria-label="Open ${esc(s.name)}">${FluentrIcons.icon('chevronRight', 16)}</button>` : ''}
        </div>
      </div>`).join('');
    return `<button class="section-link flex gap-8" style="align-items:center;margin-bottom:10px;background:none;border:none;" data-action="navigate" data-route="league">${FluentrIcons.icon('arrowLeft', 15)} League</button>
      <div class="comeback-hero">
        <div style="font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;opacity:.85;">Catch Up</div>
        <div class="comeback-hero-number">${gap > 0 ? gap : 0} XP</div>
        <div style="font-size:13px;opacity:.9;">${gap > 0 ? `to take the lead over ${esc(otherProfile.name)}` : `You're already ahead — keep the lead!`}</div>
      </div>
      ${FluentrMascot.bubble('competitive', 'Mix and match, or just hit Start Comeback for a session sized to close the gap.', 46)}
      <div class="section-head"><span class="section-title">Quick comeback</span></div>
      ${cards}
      <div class="card mt-16" style="text-align:center;">
        <div class="text-faint" style="font-size:11.5px;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Total possible</div>
        <div style="font-family:var(--font-display);font-weight:800;font-size:20px;color:var(--xp);">+${totalPossible} XP</div>
      </div>
      <button class="btn btn-couple btn-block mt-16" data-action="start-comeback">Start Comeback</button>`;
  }

  function pillarCard(route, name, sub, icon, color, bg) {
    return `<button class="pillar-card" data-action="navigate" data-route="${route}">
      <div class="pillar-icon" style="background:${bg};color:${color};">${FluentrIcons.icon(icon, 18)}</div>
      <div><div class="pillar-name">${esc(name)}</div><div class="pillar-sub">${esc(sub)}</div></div>
    </button>`;
  }

  function nextLessonPreview(profile) {
    const next = FluentrLessonEngine.findNextLesson(profile);
    if (!next) return `<div class="empty-state"><div class="empty-state-title">Path complete — nicely done.</div><div class="empty-state-sub">Check Smart Review to stay sharp, or explore the pillars below.</div></div>`;
    const up = next.unitProgress;
    const pctDone = up ? Math.round((up.done / up.total) * 100) : 0;
    return `
      <div class="page-eyebrow text-faint" style="font-weight:800;font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Continue your journey</div>
      <div style="font-weight:800;font-size:16px;font-family:var(--font-display);">${esc(next.unitName)}</div>
      <div class="text-faint" style="font-size:12.5px;margin-top:2px;margin-bottom:12px;">${esc(next.lessonName)}</div>
      <div class="goal-bar-track"><div class="goal-bar-fill" style="width:${pctDone}%;"></div></div>
      <div class="flex" style="align-items:center;justify-content:space-between;margin-top:14px;gap:12px;">
        <div class="flex gap-8" style="font-size:11.5px;color:var(--ink-faint);">
          <span>${pctDone}% of module</span><span>·</span><span>~${next.estMinutes} min</span><span>·</span><span style="color:var(--xp);font-weight:700;">+${next.estXP} XP</span>
        </div>
        <button class="btn btn-primary btn-sm" data-action="start-lesson" data-unit="${next.unitId}" data-lesson="${next.lessonId}">Continue →</button>
      </div>`;
  }

  /* ============ Learn (Path) ============ */

  function renderLearn(profile) {
    const blocks = window.WL_CURRICULUM.map((unit) => {
      const nodesHTML = unit.lessons.map((l, i) => {
        const state = FluentrLessonEngine.lessonState(profile, unit, l.id);
        const connector = i > 0 ? `<div class="path-connector ${state.prevDone ? 'done' : ''}"></div>` : '';
        return `${connector}
        <div class="path-node-wrap">
          <button class="path-node ${state.cls}" ${state.cls === 'locked' ? 'disabled' : ''} data-action="start-lesson" data-unit="${unit.id}" data-lesson="${l.id}">
            ${state.cls === 'done' ? FluentrIcons.icon('check', 24) : FluentrIcons.icon('learn', 22)}
          </button>
          <div class="path-node-label">${esc(l.name)}</div>
        </div>`;
      }).join('');

      const chState = FluentrLessonEngine.challengeState(profile, unit);
      const challengeHTML = `<div class="path-connector ${chState.prevDone ? 'done' : ''}"></div>
        <div class="path-node-wrap">
          <button class="path-node challenge ${chState.cls}" ${chState.cls === 'locked' ? 'disabled' : ''} data-action="start-challenge" data-unit="${unit.id}">
            ${chState.cls === 'done' ? FluentrIcons.icon('check', 22) : FluentrIcons.icon('trophy', 20)}
          </button>
          <div class="path-node-label">${esc(unit.challenge.name)}</div>
        </div>`;

      return `<div class="unit-block">
        <div class="unit-head"><div class="unit-name">${esc(unit.name)}</div><div class="unit-meta">${esc(unit.tagline)}</div></div>
        <div class="path-track">${nodesHTML}${challengeHTML}</div>
      </div>`;
    }).join('');

    return `<div class="page-eyebrow" style="font-weight:700;color:var(--ink-faint);font-size:12.5px;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">The Path</div>
      <h1 style="margin-bottom:22px;">Learn</h1>
      ${blocks}`;
  }

  /* ============ Lesson / exercise session ============ */

  function renderSessionHeader(index, total) {
    return `<div class="session-header">
      <button class="icon-btn" data-action="exit-session" aria-label="Exit exercise" type="button">${FluentrIcons.icon('x', 17)}</button>
      <div class="session-progress-track"><div class="session-progress-fill" style="width:${Math.round((index / total) * 100)}%;"></div></div>
      ${heartsRow(FluentrApp.currentHearts())}
    </div>`;
  }

  function renderExerciseItem(item, index, total, answerState) {
    const ex = item.data;
    let body = '';
    if (item.type === 'mc') body = renderMC(ex, answerState);
    else if (item.type === 'fill') body = renderFill(ex, answerState);
    else if (item.type === 'reorder') body = renderReorder(ex, answerState);
    else if (item.type === 'translate') body = renderTranslate(ex, answerState);
    else if (item.type === 'match') body = renderMatch(ex, answerState);
    return renderSessionHeader(index, total) + body;
  }

  function renderMC(ex, st) {
    const options = ex.options.map((opt, i) => {
      let cls = '';
      if (st.answered) { if (i === ex.answer) cls = 'correct'; else if (i === st.selected) cls = 'incorrect'; }
      return `<button class="option-btn ${cls}" data-action="answer-mc" data-index="${i}" ${st.answered ? 'disabled' : ''}>${esc(opt)}</button>`;
    }).join('');
    const correct = st.selected === ex.answer;
    return `<div class="exercise-card">
      <div class="exercise-meta"><span class="chip chip-brand">${esc(ex.category || 'Multiple Choice')}</span>${ex.level ? `<span class="chip">${esc(ex.level)}</span>` : ''}</div>
      <div class="exercise-question">${esc(ex.question)}</div>
      <div class="option-list">${options}</div>
      ${st.answered ? FluentrFeedback.panel({ correct, pt: ex.pt || ex.explanation, natural: ex.options[ex.answer], xp: st.xpAwarded, wrongExample: !correct && st.selected != null ? ex.options[st.selected] : null }) : ''}
      ${st.answered ? continueFooter() : ''}
    </div>`;
  }

  function renderFill(ex, st) {
    const options = ex.options.map((opt, i) => {
      let cls = '';
      if (st.answered) { if (i === ex.answer) cls = 'correct'; else if (i === st.selected) cls = 'incorrect'; }
      return `<button class="option-btn ${cls}" data-action="answer-mc" data-index="${i}" ${st.answered ? 'disabled' : ''}>${esc(opt)}</button>`;
    }).join('');
    const correct = st.selected === ex.answer;
    return `<div class="exercise-card">
      <div class="exercise-meta"><span class="chip chip-brand">Complete the sentence</span><span class="chip">${esc(ex.level)}</span></div>
      <div class="exercise-question">${esc(ex.question)}</div>
      <div class="option-list">${options}</div>
      ${st.answered ? FluentrFeedback.panel({ correct, pt: ex.pt || ex.explanation, natural: ex.options[ex.answer], xp: st.xpAwarded, wrongExample: !correct && st.selected != null ? ex.options[st.selected] : null }) : ''}
      ${st.answered ? continueFooter() : ''}
    </div>`;
  }

  function renderReorder(ex, st) {
    const bank = st.bankIndices.map((wi) => `<button class="word-chip" data-action="reorder-pick" data-wi="${wi}" ${st.answered ? 'disabled' : ''}>${esc(ex.words[wi])}</button>`).join('');
    const slots = st.picked.map((wi) => `<button class="word-chip" data-action="reorder-unpick" data-pos="${st.picked.indexOf(wi)}" ${st.answered ? 'disabled' : ''}>${esc(ex.words[wi])}</button>`).join('');
    const canCheck = st.picked.length === ex.words.length && !st.answered;
    const attempted = st.picked.map((wi) => ex.words[wi]).join(' ');
    return `<div class="exercise-card">
      <div class="exercise-meta"><span class="chip chip-brand">Reorder words</span><span class="chip">${esc(ex.level)}</span></div>
      <div class="exercise-question">${esc(ex.question)}</div>
      <div class="answer-slot-row">${slots}</div>
      <div class="word-bank">${bank}</div>
      ${!st.answered ? `<button class="btn btn-primary btn-block" data-action="check-reorder" ${canCheck ? '' : 'disabled'}>Check</button>` : ''}
      ${st.answered ? FluentrFeedback.panel({ correct: st.correct, pt: ex.pt || ex.explanation, natural: ex.words.join(' '), xp: st.xpAwarded, wrongExample: !st.correct ? attempted : null }) : ''}
      ${st.answered ? continueFooter() : ''}
    </div>`;
  }

  function renderTranslate(ex, st) {
    return `<div class="exercise-card">
      <div class="exercise-meta"><span class="chip chip-brand">Translation</span><span class="chip">${esc(ex.level)}</span></div>
      <div class="exercise-question">${esc(ex.question)}</div>
      <input type="text" class="text-answer-input" id="translate-input" placeholder="Type your answer in English…" ${st.answered ? 'disabled' : ''} value="${esc(st.typed || '')}">
      ${!st.answered ? `<button class="btn btn-primary btn-block mt-16" data-action="check-translate">Check</button>` : ''}
      ${st.answered ? FluentrFeedback.panel({ correct: st.correct, pt: ex.pt || ex.explanation, natural: ex.accepted.join(' / '), xp: st.xpAwarded, wrongExample: !st.correct && st.typed ? st.typed : null }) : ''}
      ${st.answered ? continueFooter() : ''}
    </div>`;
  }

  function renderMatch(ex, st) {
    const left = ex.pairs.map((p, i) => `<button class="match-item ${st.matched.includes(i) ? 'matched' : st.selLeft === i ? 'selected' : ''}" data-action="match-left" data-i="${i}" ${st.matched.includes(i) ? 'disabled' : ''}>${esc(p.term)}</button>`).join('');
    const right = st.shuffledRight.map((ri) => `<button class="match-item ${st.matched.includes(ri) ? 'matched' : st.selRight === ri ? 'selected' : ''}" data-action="match-right" data-i="${ri}" ${st.matched.includes(ri) ? 'disabled' : ''}>${esc(ex.pairs[ri].meaning)}</button>`).join('');
    const done = st.matched.length === ex.pairs.length;
    return `<div class="exercise-card">
      <div class="exercise-meta"><span class="chip chip-brand">Vocabulary Match</span><span class="chip">${esc(ex.level)}</span></div>
      <div class="exercise-question">${esc(ex.question)}</div>
      <div class="match-grid">${left}${right}</div>
      ${done ? feedbackPanel(true, 'Great — you matched them all correctly.') : ''}
      ${done ? continueFooter() : ''}
    </div>`;
  }

  function feedbackPanel(correct, html) {
    return `<div class="feedback-panel ${correct ? 'correct' : 'incorrect'}">
      <div class="feedback-title">${correct ? 'Nice! ' + FluentrIcons.icon('check', 15) : 'Not quite'}</div>
      <div class="feedback-body">${html}</div>
    </div>`;
  }
  function continueFooter() { return `<div class="session-footer"><button class="btn btn-primary btn-block" data-action="next-item">Continue</button></div>`; }

  function renderLessonComplete(summary) {
    const fluState = summary.perfect ? 'celebrating' : summary.accuracy >= 0.6 ? 'proud' : 'encouraging';
    return `<div class="complete-card">
      <div style="display:flex;justify-content:center;margin-bottom:10px;">${FluentrMascot.avatar(fluState, 72)}</div>
      <div class="complete-badge">${FluentrIcons.icon('trophy', 40)}</div>
      <h2 style="font-size:21px;margin-bottom:4px;">Lesson Complete!</h2>
      <p class="text-soft">${summary.perfect ? 'Perfect lesson — every answer correct.' : 'Nice work — every rep compounds.'}</p>
      <div class="complete-stat-grid">
        <div class="complete-stat"><div class="complete-stat-value" style="color:var(--xp);">+${summary.xp}</div><div class="complete-stat-label">XP</div></div>
        <div class="complete-stat"><div class="complete-stat-value">${pct(summary.accuracy)}</div><div class="complete-stat-label">Accuracy</div></div>
        <div class="complete-stat"><div class="complete-stat-value">${summary.newPhrases}</div><div class="complete-stat-label">New phrases</div></div>
      </div>
      ${summary.breakdown ? xpBreakdownBlock(summary.breakdown) : ''}
      <button class="btn btn-primary btn-block" data-action="navigate" data-route="learn">Continue</button>
    </div>`;
  }

  function xpBreakdownBlock(b) {
    const rows = [
      ['Base XP', b.base],
      b.accuracyBonus ? ['Accuracy bonus', b.accuracyBonus] : null,
      b.streakBonus ? ['Streak bonus', b.streakBonus] : null,
      b.perfectBonus ? ['Perfect round', b.perfectBonus] : null
    ].filter(Boolean);
    return `<div class="xp-breakdown">
      ${rows.map(([label, val]) => `<div class="xp-breakdown-row"><span>${esc(label)}</span><span>+${val}</span></div>`).join('')}
      <div class="xp-breakdown-row total"><span>Total</span><span>+${b.total}</span></div>
    </div>`;
  }

  function renderOutOfHearts() {
    return `<div class="complete-card">
      <div style="display:flex;justify-content:center;margin-bottom:10px;">${FluentrMascot.avatar('sad', 76)}</div>
      <h2 style="font-size:20px;margin-bottom:6px;">Out of hearts</h2>
      <p class="text-soft">Practice a few review questions to earn hearts back — no pressure, no timer.</p>
      <button class="btn btn-primary btn-block mt-16" data-action="start-heart-recovery">Practice to recover hearts</button>
      <button class="btn btn-ghost btn-block mt-8" data-action="navigate" data-route="home">Back to Home</button>
    </div>`;
  }

  /* ============ Practice hub ============ */

  function renderPractice(profile) {
    const review = FluentrLessonEngine.buildAdaptiveSession(profile, 10);
    return `<h1 style="margin-bottom:4px;">Practice</h1>
      <p class="text-soft" style="margin-bottom:20px;">The five pillars — plus a review built from your own history.</p>
      <div class="pillar-grid">
        ${pillarCard('sos', 'English SOS', 'I need it now', 'bolt', 'var(--streak)', 'var(--streak-soft)')}
        ${pillarCard('say', 'What Should I Say?', 'Real situations', 'message', 'var(--brand)', 'var(--brand-soft)')}
        ${pillarCard('traps', 'Brazilian Traps', 'Stop translating', 'languages', 'var(--couple)', 'var(--couple-soft)')}
        ${pillarCard('writing', 'Write Better', 'Messages & email', 'mail', 'var(--success)', 'var(--success-soft)')}
        ${pillarCard('technical', 'Tech English', 'In context', 'terminal', 'var(--brand-strong)', 'var(--brand-soft)')}
        ${pillarCard('phrasebook', 'Phrasebook', 'Your saved phrases', 'book', '#a06400', 'var(--xp-soft)')}
      </div>
      <div class="section">
        <div class="section-head"><span class="section-title">Smart Review</span></div>
        <div class="card">
          <div class="flex" style="justify-content:space-between;align-items:center;">
            <div><div style="font-weight:700;">${review.length} items ready</div><div class="text-faint" style="font-size:12px;margin-top:2px;">Built from what you've missed or haven't seen in a while</div></div>
            <button class="btn btn-primary btn-sm" data-action="start-review">Start</button>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="section-head"><span class="section-title">Quick Practice</span></div>
        <div class="grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <button class="btn btn-subtle" data-action="start-quick" data-minutes="5">5 min</button>
          <button class="btn btn-subtle" data-action="start-quick" data-minutes="10">10 min</button>
        </div>
      </div>`;
  }

  /* ============ Brazilian Traps ============ */

  function renderTraps(profile, filterCategory) {
    const cats = [...new Set(window.WL_DATA.traps.map((t) => t.category))];
    const tabs = ['All'].concat(cats).map((c) => `<button class="tone-tab ${((!filterCategory && c === 'All') || filterCategory === c) ? 'active' : ''}" data-action="filter-traps" data-cat="${c === 'All' ? '' : c}">${c}</button>`).join('');
    const items = window.WL_DATA.traps.filter((t) => !filterCategory || t.category === filterCategory);
    const cards = items.map((t) => `
      <div class="trap-card" data-action="mark-trap-seen" data-id="${t.id}">
        <div class="trap-wrong">${FluentrIcons.icon('x', 15)} ${esc(t.wrong)}</div>
        <div class="trap-right">${FluentrIcons.icon('check', 15)} ${esc(t.right)}</div>
        <div class="trap-explain">${esc(t.pt || t.explanation)}</div>
      </div>`).join('');
    return `<button class="section-link flex gap-8" style="align-items:center;margin-bottom:10px;background:none;border:none;" data-action="navigate" data-route="practice">${FluentrIcons.icon('arrowLeft', 15)} Practice</button>
      <h1 style="margin-bottom:4px;">Brazilian English Traps</h1>
      <p class="text-soft" style="margin-bottom:16px;">Common literal-translation mistakes — and the natural alternative.</p>
      <button class="btn btn-couple btn-block" style="margin-bottom:18px;" data-action="start-spot-brazilian">Spot the Brazilian — quick quiz</button>
      <div class="tone-tabs">${tabs}</div>
      ${cards}`;
  }

  /* ============ What Should I Say? ============ */

  function renderSay(profile, query, results) {
    const list = results || window.WL_DATA.say;
    const cards = list.map((s) => `<div class="say-result-card" data-action="open-say" data-id="${s.id}">
      <div class="chip chip-brand" style="margin-bottom:8px;">${esc(s.category)}</div>
      <div style="font-weight:700;font-size:14px;">${esc(s.situation)}</div>
    </div>`).join('');
    return `<h1 style="margin-bottom:4px;">What Should I Say?</h1>
      <p class="text-soft" style="margin-bottom:16px;">Describe your situation — get three ways to say it.</p>
      ${FluentrMascot.bubble('speaking', 'Describe it in Portuguese if that\'s easier — I\'ll find the words.', 48)}
      <div class="say-search">
        ${FluentrIcons.icon('search', 17)}<span class="say-search-icon">${FluentrIcons.icon('search', 17)}</span>
        <input type="text" id="say-search-input" placeholder="e.g. pedir mais tempo, discordar, small talk…" value="${esc(query || '')}">
      </div>
      ${cards || `<div class="empty-state"><div class="empty-state-sub">No matches — try a different word.</div></div>`}`;
  }

  function renderSayDetail(s) {
    return `<button class="section-link flex gap-8" style="align-items:center;margin-bottom:10px;background:none;border:none;" data-action="navigate" data-route="say">${FluentrIcons.icon('arrowLeft', 15)} What Should I Say?</button>
      <div class="chip chip-brand" style="margin-bottom:10px;">${esc(s.category)}</div>
      <h2 style="font-size:18px;margin-bottom:18px;">${esc(s.situation)}</h2>
      <div class="register-block register-simple"><div class="register-label">Simple</div><div class="register-text">${esc(s.simple)}</div></div>
      <div class="register-block register-natural"><div class="register-label">Natural</div><div class="register-text">${esc(s.natural)}</div></div>
      <div class="register-block register-professional"><div class="register-label">Professional</div><div class="register-text">${esc(s.professional)}</div></div>
      <div class="card mt-16"><div class="career-block-label" style="font-size:11px;font-weight:800;color:var(--ink-faint);text-transform:uppercase;margin-bottom:6px;">💡 Por quê</div><div class="text-soft" style="font-size:13.5px;line-height:1.6;">${esc(s.pt || s.nuance)}</div></div>
      ${s.vocab ? `<div class="vocab-list mt-16" style="display:flex;flex-wrap:wrap;gap:8px;">${s.vocab.map((v) => `<span class="chip">${esc(v.term)} — ${esc(v.meaning)}</span>`).join('')}</div>` : ''}
      <button class="btn btn-primary btn-block mt-16" data-action="complete-say" data-id="${s.id}">Got it</button>`;
  }

  /* ============ Write Better ============ */

  function renderWriting(profile) {
    const items = window.WL_DATA.writing;
    const cards = items.map((w, i) => `<div class="list-card say-result-card" data-action="open-writing" data-id="${w.id}">
      <div class="chip" style="margin-bottom:8px;">${esc(w.channel)}</div>
      <div style="font-style:italic;font-size:13.5px;color:var(--ink-soft);">"${esc(w.original.length > 60 ? w.original.slice(0, 60) + '…' : w.original)}"</div>
    </div>`).join('');
    return `<h1 style="margin-bottom:4px;">Write Better</h1>
      <p class="text-soft" style="margin-bottom:16px;">See rough messages transformed — Correct, Natural, Professional.</p>
      ${FluentrMascot.bubble('writing', "Let's make your message clear, natural, and professional.", 48)}
      ${cards}`;
  }

  function renderWritingDetail(w, tone) {
    tone = tone || 'correct';
    const tones = [['correct', 'Correct'], ['natural', 'Natural'], ['professional', 'Professional']];
    const tabs = tones.map(([id, label]) => `<button class="tone-tab ${tone === id ? 'active' : ''}" data-action="writing-tone" data-tone="${id}">${label}</button>`).join('');
    return `<button class="section-link flex gap-8" style="align-items:center;margin-bottom:10px;background:none;border:none;" data-action="navigate" data-route="writing">${FluentrIcons.icon('arrowLeft', 15)} Write Better</button>
      <div class="chip" style="margin-bottom:10px;">${esc(w.channel)} · ${esc(w.level)}</div>
      <div class="transform-original">"${esc(w.original)}"</div>
      <div class="tone-tabs">${tabs}</div>
      <div class="register-block register-natural"><div class="register-text">${esc(w[tone])}</div></div>
      <div class="card mt-16"><div class="career-block-label" style="font-size:11px;font-weight:800;color:var(--ink-faint);text-transform:uppercase;margin-bottom:6px;">💡 Por quê</div><div class="text-soft" style="font-size:13.5px;line-height:1.6;">${esc(w.pt || w.explanation)}</div></div>
      <button class="btn btn-primary btn-block mt-16" data-action="complete-writing" data-id="${w.id}">Got it</button>`;
  }

  /* ============ Technical English ============ */

  function renderTechnical(profile) {
    const items = window.WL_DATA.technical;
    const cards = items.map((t) => `<div class="list-card say-result-card" data-action="open-technical" data-id="${t.id}">
      <div class="chip chip-brand" style="margin-bottom:8px;">${esc(t.area)}</div>
      <div style="font-size:13.5px;font-weight:600;">${esc(t.technical)}</div>
    </div>`).join('');
    return `<h1 style="margin-bottom:4px;">Technical English in Context</h1>
      <p class="text-soft" style="margin-bottom:16px;">One technical fact. Explain it to a customer, a manager, and an engineer.</p>
      ${FluentrMascot.bubble('tech', 'Same fact, three audiences. Watch the register shift.', 48)}
      ${cards}`;
  }

  function renderTechnicalDetail(t, audience) {
    audience = audience || (t.customer ? 'customer' : 'manager');
    const avail = ['customer', 'manager', 'engineer'].filter((a) => t[a]);
    const tabs = avail.map((a) => `<button class="audience-tab ${audience === a ? 'active' : ''}" data-action="tech-audience" data-a="${a}">${a.charAt(0).toUpperCase() + a.slice(1)}</button>`).join('');
    return `<button class="section-link flex gap-8" style="align-items:center;margin-bottom:10px;background:none;border:none;" data-action="navigate" data-route="technical">${FluentrIcons.icon('arrowLeft', 15)} Tech English</button>
      <div class="chip chip-brand" style="margin-bottom:10px;">${esc(t.area)}</div>
      <div class="exercise-scenario-box mono" style="font-size:13.5px;">${esc(t.technical)}</div>
      <div class="section-title mt-16" style="margin-bottom:10px;">Explain it to...</div>
      <div class="audience-tabs">${tabs}</div>
      <div class="register-block register-natural"><div class="register-text">${esc(t[audience])}</div></div>
      ${t.pt ? `<div class="card mt-16"><div class="career-block-label" style="font-size:11px;font-weight:800;color:var(--ink-faint);text-transform:uppercase;margin-bottom:6px;">💡 Por quê o registro muda</div><div class="text-soft" style="font-size:13.5px;line-height:1.6;">${esc(t.pt)}</div></div>` : ''}
      ${t.vocab ? `<div class="vocab-list mt-16" style="display:flex;flex-wrap:wrap;gap:8px;">${t.vocab.map((v) => `<span class="chip">${esc(v.term)} — ${esc(v.meaning)}</span>`).join('')}</div>` : ''}
      <button class="btn btn-primary btn-block mt-16" data-action="complete-technical" data-id="${t.id}">Got it</button>`;
  }

  /* ============ English SOS ============ */

  function renderSOSHub() {
    const cards = window.WL_DATA.sos.packs.map((p) => `<button class="pillar-card" data-action="open-sos" data-id="${p.id}">
      <div class="pillar-icon" style="background:var(--streak-soft);color:var(--streak);">${FluentrIcons.icon(p.icon, 18)}</div>
      <div class="pillar-name">${esc(p.title)}</div>
    </button>`).join('');
    return `${FluentrMascot.bubble('sos', "Meeting in 5? Interview now? Tell me what you need — I've got you.", 52)}
      <div class="sos-cta" style="cursor:default;">
        <div class="sos-cta-left"><div class="sos-cta-icon">${FluentrIcons.icon('bolt', 22)}</div><div><div class="sos-cta-title">I need English now</div><div class="sos-cta-sub">What do you need?</div></div></div>
      </div>
      <div class="pillar-grid">${cards}
        <button class="pillar-card" data-action="open-sos-interview">
          <div class="pillar-icon" style="background:var(--brand-soft);color:var(--brand);">${FluentrIcons.icon('mic', 18)}</div>
          <div class="pillar-name">Interview</div>
        </button>
      </div>`;
  }

  function renderSOSPack(pack) {
    const phrases = pack.essentialPhrases.map((p) => `<div class="vocab-row" style="cursor:default;"><div><div class="vocab-term">${esc(p.phrase)}</div><div class="text-faint" style="font-size:12px;">${esc(p.meaning)}</div></div></div>`).join('');
    const questions = pack.possibleQuestions.map((q) => `<li style="padding:8px 0;border-bottom:1px solid var(--line-soft);font-size:13.5px;">${esc(q)}</li>`).join('');
    return `<button class="section-link flex gap-8" style="align-items:center;margin-bottom:10px;background:none;border:none;" data-action="navigate" data-route="sos">${FluentrIcons.icon('arrowLeft', 15)} English SOS</button>
      <h1 style="margin-bottom:16px;">${esc(pack.title)} Survival Kit</h1>
      <div class="section-head"><span class="section-title">Essential phrases</span></div>
      ${phrases}
      <div class="section-head mt-16"><span class="section-title">Quick warm-up</span></div>
      <button class="btn btn-primary btn-block" data-action="start-sos-warmup" data-id="${pack.id}">Start warm-up (3 questions)</button>
      <div class="section-head mt-16"><span class="section-title">Possible questions</span></div>
      <ul>${questions}</ul>
      <div class="card mt-16" style="text-align:center;background:var(--brand-soft);"><strong>Ready.</strong><div class="text-soft mt-8">Good luck. You've got this.</div></div>`;
  }

  function renderSOSInterviewHub() {
    const cards = window.WL_DATA.sos.interview.categories.map((c) => `<button class="pillar-card" data-action="open-sos-interview-cat" data-id="${c.id}">
      <div class="pillar-icon" style="background:var(--brand-soft);color:var(--brand);">${FluentrIcons.icon('mic', 18)}</div>
      <div class="pillar-name">${esc(c.name)}</div>
    </button>`).join('');
    return `<button class="section-link flex gap-8" style="align-items:center;margin-bottom:10px;background:none;border:none;" data-action="navigate" data-route="sos">${FluentrIcons.icon('arrowLeft', 15)} English SOS</button>
      <h1 style="margin-bottom:16px;">SOS Interview</h1>
      <div class="pillar-grid">${cards}</div>`;
  }

  function renderSOSInterviewCategory(cat) {
    const qs = cat.questions.map((q) => `<div class="card mt-16">
      <div style="font-weight:800;font-family:var(--font-display);font-size:15px;margin-bottom:10px;">${esc(q.q)}</div>
      <div class="career-block-label" style="font-size:10.5px;font-weight:800;color:var(--ink-faint);text-transform:uppercase;margin-bottom:4px;">Structure</div>
      <div class="text-soft" style="font-size:13.5px;margin-bottom:10px;">${esc(q.structure)}</div>
      <div class="career-block-label" style="font-size:10.5px;font-weight:800;color:var(--ink-faint);text-transform:uppercase;margin-bottom:4px;">Example</div>
      <div style="font-size:13.5px;font-style:italic;">"${esc(q.example)}"</div>
    </div>`).join('');
    return `<button class="section-link flex gap-8" style="align-items:center;margin-bottom:10px;background:none;border:none;" data-action="open-sos-interview">${FluentrIcons.icon('arrowLeft', 15)} SOS Interview</button>
      <h1 style="margin-bottom:4px;">${esc(cat.name)}</h1>
      ${qs}`;
  }

  /* ============ Simulator (Meeting / Interview) ============ */

  function renderSimulatorStep(sim, index, answerState) {
    const total = sim.steps.length;
    if (index >= total) return renderSimulatorComplete(sim);
    const step = sim.steps[index];
    const options = step.options.map((opt, i) => {
      let cls = '';
      if (answerState.answered) { if (i === step.answer) cls = 'correct'; else if (i === answerState.selected) cls = 'incorrect'; }
      return `<button class="option-btn ${cls}" data-action="answer-sim" data-index="${i}" ${answerState.answered ? 'disabled' : ''}>${esc(opt)}</button>`;
    }).join('');
    return `<div class="session-header">
        <button class="icon-btn" data-action="exit-session" aria-label="Exit exercise" type="button">${FluentrIcons.icon('x', 17)}</button>
        <div class="session-progress-track"><div class="session-progress-fill" style="width:${Math.round((index / total) * 100)}%;"></div></div>
        <span class="text-faint mono" style="font-size:12px;">${index + 1}/${total}</span>
      </div>
      <div class="exercise-card">
        <div class="chip chip-brand" style="margin-bottom:12px;">${esc(sim.title)}</div>
        <div class="exercise-scenario-box"><strong>${esc(step.speaker)}:</strong> "${esc(step.line)}"</div>
        <div class="option-list">${options}</div>
        ${answerState.answered ? feedbackPanel(answerState.selected === step.answer, `The most natural response uses: <strong>"${esc(step.phrase)}"</strong>`) : ''}
        ${answerState.answered ? continueFooter() : ''}
      </div>`;
  }

  function renderSimulatorComplete(sim) {
    const phrases = sim.steps.map((s) => `<span class="chip chip-brand">${esc(s.phrase)}</span>`).join(' ');
    return `<div class="complete-card">
      <div class="complete-badge">${FluentrIcons.icon('trophy', 40)}</div>
      <h2 style="font-size:20px;">${esc(sim.title)} complete!</h2>
      <p class="text-soft" style="margin-bottom:16px;">Key phrases you practiced:</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">${phrases}</div>
      <button class="btn btn-primary btn-block mt-16" data-action="navigate" data-route="learn">Continue</button>
    </div>`;
  }

  /* ============ League / Duels ============ */

  function renderLeague(profile, otherProfile, couple) {
    const stats = FluentrGamification.buildStats(profile);
    const otherStats = FluentrGamification.buildStats(otherProfile);
    const champs = couple.weeklyChampions || [];
    const winsA = champs.filter((w) => w.winnerId === profile.id).length;
    const winsB = champs.filter((w) => w.winnerId === otherProfile.id).length;
    const last4 = champs.slice(-4);
    const trophyRow = (id) => last4.map((w) => w.winnerId === id ? '🏆' : '·').join(' ') || '—';

    const bothDoneToday = !!(couple.dailyChallenge.completions[profile.id] && couple.dailyChallenge.completions[otherProfile.id]);
    const streakAtRisk = couple.streak.current > 0 && !bothDoneToday && new Date().getHours() >= 20;

    let fluState, fluMsg;
    if (streakAtRisk) { fluState = 'streak-danger'; fluMsg = `Your ${couple.streak.current}-day Couple Streak ends tonight if you don't both play today.`; }
    else if (couple.streak.current >= 3) { fluState = 'love'; fluMsg = `${couple.streak.current} days learning together in a row — that's the real win. 💚`; }
    else { fluState = 'competitive'; fluMsg = "May the best XP win. Good luck to both of you! ⚡"; }

    return `<h1 style="margin-bottom:16px;">Couple League</h1>
      ${FluentrMascot.bubble(fluState, esc(fluMsg), 48)}
      ${streakAtRisk ? `<button class="btn btn-couple btn-block" style="margin-bottom:16px;" data-action="open-couple-challenge">Save Our Streak</button>` : ''}
      <div class="league-card">
        <div class="league-head">
          <span class="league-title">${FluentrIcons.icon('league', 14)} This Week</span>
          <span class="flex gap-8">${couple.streak.current > 0 ? `<span class="chip chip-couple">❤️ ${couple.streak.current}d couple streak</span>` : ''}<span class="chip mono">${flWeekTimeLeftLabel()}</span></span>
        </div>
        <div class="league-vs">
          <div class="league-side">${avatar(profile, 50)}<div class="league-name mt-8">${esc(profile.name)}</div><div class="league-xp">${stats.weeklyXP} XP</div><div class="text-faint" style="font-size:10.5px;margin-top:2px;">🔥 ${stats.currentStreak}d</div></div>
          <div class="league-vs-divider">VS</div>
          <div class="league-side">${avatar(otherProfile, 50)}<div class="league-name mt-8">${esc(otherProfile.name)}</div><div class="league-xp">${otherStats.weeklyXP} XP</div><div class="text-faint" style="font-size:10.5px;margin-top:2px;">🔥 ${otherStats.currentStreak}d</div></div>
        </div>
        <div class="league-bar-track"><div class="league-bar-a" style="width:${pct(leagueSplitPct(stats.weeklyXP, otherStats.weeklyXP))};"></div><div class="league-bar-b" style="flex:1;"></div></div>
      </div>

      <div class="card mt-16" style="margin-bottom:18px;">
        <div class="flex" style="justify-content:space-between;align-items:center;">
          <div><div style="font-weight:700;">Daily Couple Challenge</div><div class="text-faint" style="font-size:12px;margin-top:2px;">${dailyCoupleStatusLabel(couple, profile, otherProfile)}</div></div>
          <button class="btn btn-couple btn-sm" data-action="open-couple-challenge">${couple.dailyChallenge.completions[profile.id] ? 'Done' : 'Play'}</button>
        </div>
      </div>

      <div class="card mt-16" style="margin-bottom:18px;">
        <div class="flex" style="justify-content:space-between;align-items:center;">
          <div><div style="font-weight:700;">Weekly Duel</div><div class="text-faint" style="font-size:12px;margin-top:2px;">Challenge ${esc(otherProfile.name)} — 10 questions, same device</div></div>
          <button class="btn btn-primary btn-sm" data-action="navigate" data-route="duel-setup">Start</button>
        </div>
      </div>

      <div class="section">
        <div class="section-head"><span class="section-title">Last 4 weeks</span></div>
        ${champs.length ? `<div class="card">
          <div class="flex" style="justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-size:12.5px;font-weight:700;">${esc(profile.name)}</span><span class="mono" style="font-size:14px;">${trophyRow(profile.id)}</span></div>
          <div class="flex" style="justify-content:space-between;align-items:center;margin-bottom:12px;"><span style="font-size:12.5px;font-weight:700;">${esc(otherProfile.name)}</span><span class="mono" style="font-size:14px;">${trophyRow(otherProfile.id)}</span></div>
          <div class="text-faint" style="text-align:center;font-size:12px;border-top:1px solid var(--line-soft);padding-top:10px;">${winsA} – ${winsB}</div>
        </div>` : `<div class="empty-state"><div class="empty-state-title">Complete your first Weekly Duel</div><div class="empty-state-sub">This week's champion history will show up here.</div></div>`}
      </div>

      <div class="section">
        <div class="section-head"><span class="section-title">Recent Duels</span></div>
        ${renderRecentDuels(couple.duelHistory, profile, otherProfile)}
      </div>
    `;
  }

  function renderRecentDuels(history, profile, otherProfile) {
    if (!history || !history.length) return `<div class="empty-state"><div class="empty-state-title">No duels yet</div><div class="empty-state-sub">Start a Duel above — 10 questions, same device, loser buys the next coffee.</div></div>`;
    const topicLabel = { business: 'Business English', technical: 'Technical English', traps: 'Brazilian Traps', mixed: 'Mixed' };
    return history.slice(0, 5).map((d) => {
      const mine = d.results[profile.id] || { score: 0 };
      const theirs = d.results[otherProfile.id] || { score: 0 };
      const iWon = d.winnerId === profile.id;
      return `<div class="duel-result-row ${iWon ? 'winner' : ''}">
        <span>${esc(topicLabel[d.topic] || d.topic)} · ${timeAgo(d.date)}</span>
        <span>${esc(profile.name)} ${mine.score} – ${theirs.score} ${esc(otherProfile.name)}</span>
      </div>`;
    }).join('');
  }

  function dailyCoupleStatusLabel(couple, profile, other) {
    const mine = couple.dailyChallenge.completions[profile.id];
    const theirs = couple.dailyChallenge.completions[other.id];
    if (mine && theirs) return 'Both completed! ✅';
    if (mine) return `Waiting on ${other.name}...`;
    return "Today's challenge is ready";
  }

  function renderCoupleChallenge(item, answerState) {
    const options = item.options.map((opt, i) => {
      let cls = '';
      if (answerState.answered) { if (i === item.answer) cls = 'correct'; else if (i === answerState.selected) cls = 'incorrect'; }
      return `<button class="option-btn ${cls}" data-action="answer-couple" data-index="${i}" ${answerState.answered ? 'disabled' : ''}>${esc(opt)}</button>`;
    }).join('');
    return `<button class="section-link flex gap-8" style="align-items:center;margin-bottom:10px;background:none;border:none;" data-action="navigate" data-route="league">${FluentrIcons.icon('arrowLeft', 15)} League</button>
      <div class="chip chip-couple" style="margin-bottom:12px;">Today's Couple Challenge · ${esc(item.category)}</div>
      <div class="exercise-card" style="padding:0;">
        <div class="exercise-question">${esc(item.question)}</div>
        <div class="option-list">${options}</div>
        ${answerState.answered ? feedbackPanel(answerState.selected === item.answer, item.explanation) : ''}
        ${answerState.answered ? `<div class="session-footer"><button class="btn btn-primary btn-block" data-action="navigate" data-route="league">Done</button></div>` : ''}
      </div>`;
  }

  function renderDuelSetup() {
    const topics = [
      { id: 'business', name: 'Business English' }, { id: 'technical', name: 'Technical English' },
      { id: 'traps', name: 'Brazilian Traps' }, { id: 'mixed', name: 'Mixed' }
    ];
    const cards = topics.map((t) => `<button class="onboard-option" data-action="pick-duel-topic" data-topic="${t.id}">${t.name}</button>`).join('');
    return `<button class="section-link flex gap-8" style="align-items:center;margin-bottom:10px;background:none;border:none;" data-action="navigate" data-route="league">${FluentrIcons.icon('arrowLeft', 15)} League</button>
      <h1 style="margin-bottom:16px;">New Duel</h1>
      <div class="onboard-options">${cards}</div>`;
  }

  function renderDuelTurn(duel, whoLabel, index, answerState) {
    const total = duel.exercises.length;
    if (index >= total) return `<div class="complete-card"><h2>Turn complete!</h2><button class="btn btn-primary btn-block mt-16" data-action="duel-next-turn">Continue</button></div>`;
    const ex = duel.exercises[index].data;
    const options = ex.options.map((opt, i) => {
      let cls = '';
      if (answerState.answered) { if (i === ex.answer) cls = 'correct'; else if (i === answerState.selected) cls = 'incorrect'; }
      return `<button class="option-btn ${cls}" data-action="answer-duel" data-index="${i}" ${answerState.answered ? 'disabled' : ''}>${esc(opt)}</button>`;
    }).join('');
    return `<div class="session-header">
        <div class="chip chip-couple">${esc(whoLabel)}'s turn</div>
        <div class="session-progress-track"><div class="session-progress-fill" style="width:${Math.round((index / total) * 100)}%;"></div></div>
        <span class="text-faint mono" style="font-size:12px;">${index + 1}/${total}</span>
      </div>
      <div class="exercise-card">
        <div class="exercise-question">${esc(ex.question)}</div>
        <div class="option-list">${options}</div>
        ${answerState.answered ? continueFooter() : ''}
      </div>`;
  }

  function renderDuelPassDevice(name) {
    return `<div class="complete-card">
      <div class="complete-badge">${FluentrIcons.icon('swords', 36)}</div>
      <h2 style="font-size:19px;">Pass the device to ${esc(name)}</h2>
      <p class="text-soft">Same 10 questions, fresh start. Ready?</p>
      <button class="btn btn-primary btn-block mt-16" data-action="duel-begin-turn">I'm ${esc(name)} — Start</button>
    </div>`;
  }

  function renderDuelResult(duel, p1, p2) {
    const r1 = duel.results[p1.id], r2 = duel.results[p2.id];
    const winnerId = r1.score !== r2.score ? (r1.score > r2.score ? p1.id : p2.id) : (r1.timeSec < r2.timeSec ? p1.id : p2.id);
    const winner = winnerId === p1.id ? p1 : p2;
    return `<div class="complete-card">
      <div class="complete-badge">${FluentrIcons.icon('trophy', 40)}</div>
      <h2 style="font-size:20px;margin-bottom:16px;">Duel Result</h2>
      <div class="duel-result-row ${winnerId === p1.id ? 'winner' : ''}"><span>${esc(p1.name)}</span><span>${r1.score}/10 · ${r1.timeSec}s</span></div>
      <div class="duel-result-row ${winnerId === p2.id ? 'winner' : ''}"><span>${esc(p2.name)}</span><span>${r2.score}/10 · ${r2.timeSec}s</span></div>
      <p style="margin-top:12px;font-weight:800;">🏆 ${esc(winner.name)} wins!</p>
      <button class="btn btn-primary btn-block mt-16" data-action="navigate" data-route="league">Back to League</button>
    </div>`;
  }

  /* ============ Badges / Trophy Room ============ */

  function renderBadges(profile) {
    const all = window.WL_BADGES;
    const unlocked = profile.badges.length;
    const rarityCounts = { rare: 0, epic: 0, legendary: 0 };
    all.forEach((b) => { if (profile.badges.includes(b.id) && rarityCounts[b.rarity] !== undefined) rarityCounts[b.rarity]++; });
    const cards = all.map((b) => {
      const has = profile.badges.includes(b.id);
      return `<div class="badge-card ${has ? 'unlocked' : ''} rarity-${b.rarity}">
        <div class="badge-icon-wrap">${FluentrIcons.icon(b.icon, 20)}</div>
        <div class="badge-name">${esc(b.name)}</div>
        <div class="badge-rarity-label" style="color:var(--rarity-${b.rarity});">${b.rarity}</div>
      </div>`;
    }).join('');
    return `<button class="section-link flex gap-8" style="align-items:center;margin-bottom:10px;background:none;border:none;" data-action="navigate" data-route="profile">${FluentrIcons.icon('arrowLeft', 15)} Profile</button>
      <h1 style="margin-bottom:4px;">Trophy Room</h1>
      <p class="text-soft" style="margin-bottom:6px;">${unlocked} / ${all.length} badges</p>
      <div class="flex gap-8" style="margin-bottom:18px;">
        <span class="chip" style="color:var(--rarity-rare);">Rare ${rarityCounts.rare}</span>
        <span class="chip" style="color:var(--rarity-epic);">Epic ${rarityCounts.epic}</span>
        <span class="chip" style="color:var(--rarity-legendary);">Legendary ${rarityCounts.legendary}</span>
      </div>
      <div class="badge-grid">${cards}</div>`;
  }

  /* ============ Profile / Progress / Settings ============ */

  function renderProfile(profile, otherProfile) {
    const stats = FluentrGamification.buildStats(profile);
    const skills = FluentrGamification.buildSkillBreakdown(profile);
    const skillRows = skills.map((s) => `
      <div class="progress-skill-row ${s.available ? '' : 'skill-locked'}">
        <div class="progress-skill-head"><span class="progress-skill-name">${esc(s.label)}${!s.available ? ' <span class=\"text-faint\" style=\"font-weight:600;\">(coming soon)</span>' : ''}</span><span class="progress-skill-pct">${s.available ? pct(s.value) : '—'}</span></div>
        <div class="goal-bar-track"><div class="goal-bar-fill" style="width:${s.available ? pct(s.value) : '0%'};"></div></div>
      </div>`).join('');

    return `<h1 style="margin-bottom:18px;">Profile</h1>
      <div class="card" style="text-align:center;margin-bottom:18px;">
        <div class="avatar-edit-wrap" data-action="upload-photo">
          ${avatar(profile, 76)}
          <div class="avatar-edit-badge">${FluentrIcons.icon('spark', 13)}</div>
        </div>
        <div style="font-family:var(--font-display);font-weight:800;font-size:18px;margin-top:10px;">${esc(profile.name)}</div>
        <div class="text-faint" style="font-size:12.5px;">${profile.cefrLevel ? FL_CEFR_LABELS[profile.cefrLevel] + ' · ' + profile.cefrLevel : 'Level not set'}</div>
        ${profile.photo && profile.photo.dataUrl ? `
          <div class="flex gap-8" style="justify-content:center;align-items:center;margin-top:12px;max-width:220px;margin-left:auto;margin-right:auto;">
            <span class="text-faint" style="font-size:11px;">Reposition</span>
            <input type="range" min="0" max="100" value="${profile.photo.posY != null ? profile.photo.posY : 50}" id="photo-posy-input" style="flex:1;">
          </div>
          <button class="section-link" style="background:none;border:none;font-size:11.5px;margin-top:2px;" data-action="remove-photo">Remove photo</button>
        ` : ''}
        <div class="flex gap-8" style="justify-content:center;margin-top:12px;">
          <span class="chip chip-xp">Lvl ${stats.level}</span><span class="chip chip-streak">🔥 ${stats.currentStreak}</span><span class="chip">${stats.totalXP} XP</span>
        </div>
        <div style="max-width:260px;margin:14px auto 0;">
          <div class="flex" style="justify-content:space-between;font-size:11px;color:var(--ink-faint);margin-bottom:4px;">
            <span>Level ${stats.level}</span><span>${stats.xpForNext ? `${stats.xpForNext} XP to Level ${stats.level + 1}` : 'Max level'}</span>
          </div>
          <div class="goal-bar-track"><div class="goal-bar-fill" style="width:${pct(stats.progress)};"></div></div>
        </div>
        <input type="file" id="photo-file-input" accept="image/*" class="visually-hidden">
      </div>

      <div class="section">
        <div class="section-head"><span class="section-title">Your English</span></div>
        <div class="card">${skillRows}</div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div class="settings-row" data-action="navigate" data-route="progress" style="cursor:pointer;"><div class="settings-row-title">Progress</div>${FluentrIcons.icon('chevronRight', 16)}</div>
        <div class="settings-row" data-action="navigate" data-route="badges" style="cursor:pointer;"><div class="settings-row-title">Trophy Room</div>${FluentrIcons.icon('chevronRight', 16)}</div>
        <div class="settings-row" data-action="navigate" data-route="phrasebook" style="cursor:pointer;"><div class="settings-row-title">Phrasebook</div>${FluentrIcons.icon('chevronRight', 16)}</div>
        <div class="settings-row" data-action="retake-placement" style="cursor:pointer;"><div class="settings-row-title">Retake placement test</div>${FluentrIcons.icon('chevronRight', 16)}</div>
      </div>
      <div class="card" style="margin-bottom:12px;">
        <div class="settings-row" data-action="switch-profile" style="cursor:pointer;"><div><div class="settings-row-title">Switch profile</div><div class="settings-row-sub">Currently: ${esc(profile.name)}</div></div>${FluentrIcons.icon('chevronRight', 16)}</div>
        <div class="settings-row" data-action="navigate" data-route="settings" style="cursor:pointer;"><div class="settings-row-title">Settings</div>${FluentrIcons.icon('chevronRight', 16)}</div>
      </div>`;
  }

  function renderProgress(profile) {
    const stats = FluentrGamification.buildStats(profile);
    const pillars = [
      ['Meetings & Business', (profile.unitActivity['u3'] || 0) + (profile.unitActivity['u8'] || 0), 60],
      ['Technology', (profile.unitActivity['u7'] || 0) + profile.pillarActivity.technical, 60],
      ['Writing', profile.pillarActivity.writing + (profile.unitActivity['u4'] || 0), 60],
      ['Natural English', profile.pillarActivity.traps, 60],
      ['Interviews', profile.unitActivity['u6'] || 0, 32]
    ];
    const rows = pillars.map(([name, val, max]) => `<div class="progress-skill-row">
      <div class="progress-skill-head"><span class="progress-skill-name">${name}</span><span class="progress-skill-pct">${pct(Math.min(1, val / max))}</span></div>
      <div class="goal-bar-track"><div class="goal-bar-fill" style="width:${pct(Math.min(1, val / max))};"></div></div>
    </div>`).join('');

    const week = weekDots(profile);

    if (!stats.totalAnswered) {
      return `<button class="section-link flex gap-8" style="align-items:center;margin-bottom:10px;background:none;border:none;" data-action="navigate" data-route="profile">${FluentrIcons.icon('arrowLeft', 15)} Profile</button>
        <h1 style="margin-bottom:16px;">Progress</h1>
        ${FluentrMascot.bubble('idle', 'Your journey starts here — complete your first lesson and this page fills in.', 52)}
        <div class="empty-state"><div class="empty-state-title">Nothing tracked yet</div><div class="empty-state-sub">XP, accuracy, streaks, and skill breakdown will show up as soon as you start practicing.</div></div>`;
    }

    return `<button class="section-link flex gap-8" style="align-items:center;margin-bottom:10px;background:none;border:none;" data-action="navigate" data-route="profile">${FluentrIcons.icon('arrowLeft', 15)} Profile</button>
      <h1 style="margin-bottom:16px;">Progress</h1>
      <div class="stat-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:20px;">
        <div class="stat-tile card"><div class="complete-stat-value">${stats.totalXP}</div><div class="complete-stat-label">Total XP</div></div>
        <div class="stat-tile card"><div class="complete-stat-value">${stats.totalAnswered}</div><div class="complete-stat-label">Exercises done</div></div>
        <div class="stat-tile card"><div class="complete-stat-value">${stats.totalAnswered ? pct(stats.accuracy) : '—'}</div><div class="complete-stat-label">Accuracy</div></div>
        <div class="stat-tile card"><div class="complete-stat-value">${stats.vocabCount}</div><div class="complete-stat-label">Words learned</div></div>
      </div>
      <div class="section-head"><span class="section-title">This week</span></div>
      <div class="card" style="margin-bottom:20px;">${week}</div>
      <div class="section-head"><span class="section-title">By area</span></div>
      <div class="card">${rows}</div>`;
  }

  function weekDots(profile) {
    const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date();
    const dow = (today.getDay() + 6) % 7; // Mon=0
    const cells = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime() - (dow - i) * 86400000);
      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      const filled = profile.streak.activeDates.includes(iso);
      const isToday = i === dow;
      cells.push(`<div class="week-dot-col"><span class="week-dot-letter">${letters[i]}</span><div class="week-dot ${filled ? 'filled' : ''} ${isToday ? 'today' : ''}">${filled ? FluentrIcons.icon('check', 13) : ''}</div></div>`);
    }
    return `<div class="week-dots">${cells.join('')}</div>`;
  }

  function renderPhrasebook(profile) {
    const terms = Object.entries(profile.vocabulary);
    if (!terms.length) return `<button class="section-link flex gap-8" style="align-items:center;margin-bottom:10px;background:none;border:none;" data-action="navigate" data-route="profile">${FluentrIcons.icon('arrowLeft', 15)} Profile</button>
      <h1 style="margin-bottom:16px;">Phrasebook</h1>
      <div class="empty-state"><div class="empty-state-title">Nothing saved yet</div><div class="empty-state-sub">Phrases you encounter in lessons and pillars will collect here automatically.</div></div>`;
    const masteryLabel = { new: 'New', learning: 'Learning', weak: 'Weak', mastered: 'Mastered' };
    const masteryColor = { new: 'var(--ink-faint)', learning: 'var(--brand)', weak: 'var(--danger)', mastered: 'var(--success)' };
    const rows = terms.map(([term, v]) => {
      const level = FluentrGamification.masteryLevel(v);
      return `<div class="vocab-row" style="cursor:default;">
      <div style="flex:1;"><div class="vocab-term">${esc(term)}</div><div class="text-faint" style="font-size:12px;">${esc(v.meaning || '')}</div></div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="text-faint" style="font-size:11px;font-weight:700;color:${masteryColor[level]};">${masteryLabel[level]}</span>
        <div class="vocab-mastery-track"><div class="vocab-mastery-fill" style="width:${pct(Math.min(1, (v.correct || 0) / Math.max(1, v.seen || 1)))};"></div></div>
      </div>
    </div>`;
    }).join('');
    return `<button class="section-link flex gap-8" style="align-items:center;margin-bottom:10px;background:none;border:none;" data-action="navigate" data-route="profile">${FluentrIcons.icon('arrowLeft', 15)} Profile</button>
      <h1 style="margin-bottom:16px;">Phrasebook</h1>${rows}`;
  }

  function notifyRowSub(permission) {
    if (permission === 'unsupported') return 'Not supported in this browser';
    if (permission === 'denied') return 'Blocked in browser settings — re-enable there first';
    return 'Nudges you when the app is open and your streak is at risk';
  }

  function renderSettings(state, profile) {
    return `<button class="section-link flex gap-8" style="align-items:center;margin-bottom:10px;background:none;border:none;" data-action="navigate" data-route="profile">${FluentrIcons.icon('arrowLeft', 15)} Profile</button>
      <h1 style="margin-bottom:18px;">Settings</h1>
      <div class="card" style="margin-bottom:14px;">
        <div class="settings-row"><div class="settings-row-title">Dark mode</div><button class="switch ${state.theme === 'dark' ? 'on' : ''}" data-action="toggle-theme"></button></div>
        <div class="form-row" style="margin-top:14px;margin-bottom:0;"><label class="form-label">Daily goal (XP)</label><input type="number" class="form-input" id="daily-goal-input" min="10" max="200" value="${profile.settings.dailyGoalXP}"></div>
        <button class="btn btn-primary btn-sm mt-8" data-action="save-daily-goal">Save</button>
      </div>
      <div class="card" style="margin-bottom:14px;">
        <div class="settings-row">
          <div><div class="settings-row-title">Streak reminders</div><div class="settings-row-sub">${notifyRowSub(state.notifyPermission)}</div></div>
          <button class="switch ${profile.settings.notifyStreak ? 'on' : ''}" data-action="toggle-streak-notify"></button>
        </div>
      </div>
      <div class="card" style="margin-bottom:14px;">
        <div class="settings-row-title" style="margin-bottom:10px;">Backup</div>
        <div class="flex gap-8" style="flex-wrap:wrap;">
          <button class="btn btn-subtle btn-sm" data-action="export-data">${FluentrIcons.icon('download', 14)} Export progress</button>
          <button class="btn btn-subtle btn-sm" data-action="export-couple">${FluentrIcons.icon('download', 14)} Export couple data</button>
          <button class="btn btn-subtle btn-sm" data-action="import-data">${FluentrIcons.icon('upload', 14)} Import</button>
        </div>
        <input type="file" id="import-file-input" accept="application/json" class="visually-hidden">
      </div>
      ${window.FLUENTR_INSTALLABLE ? `<div class="card" style="margin-bottom:14px;"><button class="btn btn-primary btn-block" data-action="install-pwa">Install Fluentr</button></div>` : ''}
      ${state.cloudEmail ? `<div class="card" style="margin-bottom:14px;">
        <div class="settings-row"><div><div class="settings-row-title">Cloud sync</div><div class="settings-row-sub">Signed in as ${esc(state.cloudEmail)}</div></div></div>
        <button class="btn btn-subtle btn-sm mt-8" data-action="sign-out">Sign out</button>
      </div>` : ''}
      <div class="card" style="border-color:var(--danger-soft);">
        <div class="settings-row-title" style="margin-bottom:10px;">Danger zone</div>
        <button class="btn btn-danger btn-sm" data-action="reset-profile">Reset this profile</button>
        <button class="btn btn-danger btn-sm mt-8" data-action="reset-all">Reset all data</button>
      </div>`;
  }

  /* ============ Week Recap ============ */

  function renderWeekRecap(recap) {
    return `<div class="recap-hero">
      <div class="page-eyebrow text-faint" style="font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Your Week</div>
      <div class="recap-big-number">${recap.exercises}</div>
      <div class="text-soft">exercises completed</div>
    </div>
    <div class="complete-stat-grid">
      <div class="complete-stat"><div class="complete-stat-value">${pct(recap.accuracy)}</div><div class="complete-stat-label">Accuracy</div></div>
      <div class="complete-stat"><div class="complete-stat-value">${recap.xp}</div><div class="complete-stat-label">XP</div></div>
      <div class="complete-stat"><div class="complete-stat-value">${recap.newPhrases}</div><div class="complete-stat-label">New phrases</div></div>
    </div>
    <div class="card mt-16"><strong>Best skill:</strong> ${esc(recap.best)}</div>
    <div class="card mt-8"><strong>Needs attention:</strong> ${esc(recap.weak)}</div>
    <div class="card mt-16" style="text-align:center;">${esc(recap.vsNote)}</div>
    <button class="btn btn-primary btn-block mt-16" data-action="navigate" data-route="home">Keep going</button>`;
  }

  /* ============ Toasts ============ */

  const TOAST_MASCOT = { streak: 'happy', levelup: 'celebrating', badge: 'proud', competitive: 'competitive', couple: 'love' };

  function showToast(title, sub, kind) {
    const root = document.getElementById('toast-root');
    const el = document.createElement('div');
    const mascotState = TOAST_MASCOT[kind];
    el.className = 'toast' + (kind === 'couple' || kind === 'competitive' ? ' toast-couple' : '');
    const iconHTML = mascotState ? FluentrMascot.avatar(mascotState, 30) : `<span class="toast-icon">${FluentrIcons.icon('bolt', 17)}</span>`;
    el.innerHTML = `${iconHTML}<div><div class="toast-title">${esc(title)}</div>${sub ? `<div class="toast-sub">${esc(sub)}</div>` : ''}</div>`;
    root.appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3400);
  }

  function showLevelUp(level) {
    const root = document.getElementById('levelup-root');
    if (!root) return;
    const el = document.createElement('div');
    el.className = 'levelup-overlay';
    el.innerHTML = `<div class="levelup-card">
      ${FluentrMascot.avatar('celebrating', 96)}
      <div class="levelup-label">Level Up</div>
      <div class="levelup-number">${level}</div>
      <div class="levelup-sub">New level, same you — a little sharper.</div>
    </div>`;
    root.appendChild(el);
    const dismiss = () => { el.classList.add('leaving'); setTimeout(() => el.remove(), 250); };
    el.addEventListener('click', dismiss);
    setTimeout(dismiss, 2400);
  }

  return {
    esc, pct, initials, avatar, xpRing, heartsRow, timeAgo, greeting,
    renderRail, renderTopbar, renderBottomNav, NAV_ITEMS, renderBootSkeleton,
    renderProfileGate, renderAuthGate, renderClaimGate, renderOnboardingGoal, renderOnboardingPlacementChoice,
    renderPlacementQuestion, renderPlacementResult,
    renderHome, renderLearn, renderExerciseItem, renderLessonComplete, renderOutOfHearts,
    renderPractice, renderTraps, renderSay, renderSayDetail, renderWriting, renderWritingDetail,
    renderTechnical, renderTechnicalDetail, renderSOSHub, renderSOSPack, renderSOSInterviewHub, renderSOSInterviewCategory,
    renderSimulatorStep, renderLeague, renderComeback, renderCoupleChallenge, renderDuelSetup, renderDuelTurn, renderDuelPassDevice, renderDuelResult,
    renderBadges, renderProfile, renderProgress, renderPhrasebook, renderSettings, renderWeekRecap,
    showToast, showLevelUp
  };
})();
