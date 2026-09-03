/* FLUENTR — core/mascot.js
   FLU, the mascot. Renders as a real illustration when assets/mascot/flu-<state>.png
   exists, and degrades gracefully to a glowing emoji badge when it doesn't (today —
   no artwork files ship in this repo yet, see assets/mascot/README.md). Every call
   site only ever asks for a *state*, never a file path, so dropping in real art
   later requires zero changes outside this file. */

const FluentrMascot = (function () {

  const STATES = {
    idle: { color: 'var(--brand)', emoji: '🦎', label: 'Idle' },
    happy: { color: 'var(--cyan)', emoji: '😄', label: 'Happy' },
    celebrating: { color: 'var(--xp)', emoji: '🎉', label: 'Celebrating' },
    proud: { color: 'var(--warning)', emoji: '✨', label: 'Proud' },
    sad: { color: 'var(--ink-faint)', emoji: '😔', label: 'Sad' },
    'streak-danger': { color: 'var(--streak)', emoji: '🔥', label: 'Streak Danger' },
    'welcome-back': { color: 'var(--success)', emoji: '👋', label: 'Welcome Back' },
    encouraging: { color: 'var(--info)', emoji: '💪', label: 'Encouraging' },
    thinking: { color: 'var(--brand)', emoji: '🤔', label: 'Thinking' },
    listening: { color: 'var(--cyan)', emoji: '🎧', label: 'Listening' },
    speaking: { color: 'var(--brand)', emoji: '💬', label: 'Speaking' },
    writing: { color: 'var(--success)', emoji: '✍️', label: 'Writing' },
    sos: { color: 'var(--danger)', emoji: '🆘', label: 'SOS' },
    tech: { color: 'var(--info)', emoji: '💻', label: 'Tech' },
    love: { color: 'var(--couple)', emoji: '💚', label: 'Love' },
    competitive: { color: 'var(--warning)', emoji: '⚡', label: 'Competitive' }
  };

  function meta(state) { return STATES[state] || STATES.idle; }

  // A self-contained <span>: tries the real PNG, falls back to an emoji badge
  // on error (onerror swaps visibility — no JS re-render needed).
  function avatar(state, size) {
    size = size || 56;
    const m = meta(state);
    const src = `assets/mascot/flu-${state}.png`;
    return `<span class="mascot mascot-${state}" style="--mascot-color:${m.color};width:${size}px;height:${size}px;font-size:${Math.round(size * 0.5)}px;">
      <img src="${src}" alt="Flu — ${m.label}" class="mascot-img" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <span class="mascot-fallback">${m.emoji}</span>
    </span>`;
  }

  // Mascot + speech bubble, the primary way Flu talks to the user.
  function bubble(state, messageHTML, size) {
    return `<div class="mascot-bubble-row">
      ${avatar(state, size || 56)}
      <div class="mascot-bubble">${messageHTML}</div>
    </div>`;
  }

  return { avatar, bubble, meta, STATES };
})();
