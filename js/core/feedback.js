/* FLUENTR — core/feedback.js
   The pedagogical feedback panel: question stays in English, the "why"
   is explained in Portuguese, the natural English form is always shown,
   and an optional "Entender melhor" <details> expands into a short rule +
   a real PT-influenced-mistake-vs-natural-form comparison — never a fake
   quiz question. Used by the Path lesson exercises, Brazilian Traps, and
   Spot the Brazilian (the three places the data layer carries `pt` text). */

const FluentrFeedback = (function () {
  function esc(str) { const d = document.createElement('div'); d.textContent = str == null ? '' : String(str); return d.innerHTML; }

  // "It's so-so. / It's okay, I guess." -> ["It's so-so.", "It's okay, I guess."]
  function splitAlt(text) {
    if (!text) return [null, null];
    const parts = String(text).split(' / ');
    return [parts[0], parts.length > 1 ? parts.slice(1).join(' / ') : null];
  }

  // opts: { correct, pt, natural, xp, wrongExample }
  function panel(opts) {
    const [naturalMain, naturalAlt] = splitAlt(opts.natural);
    const title = opts.correct ? '✅ Perfeito!' : '❌ Quase!';
    const xpLine = opts.correct && opts.xp ? `<div class="feedback-xp">+${opts.xp} XP</div>` : '';
    const naturalLine = naturalMain ? `<div class="feedback-natural"><span class="feedback-tag">✅ Natural:</span> "${esc(naturalMain)}"</div>` : '';
    const altLine = naturalAlt ? `<div class="feedback-alt"><span class="feedback-tag">💬 Outra forma natural:</span> "${esc(naturalAlt)}"</div>` : '';
    const hasDeepDive = !!(opts.pt || opts.wrongExample);
    const deepDive = hasDeepDive ? `<details class="feedback-details">
        <summary>Entender melhor</summary>
        <div class="feedback-details-body">
          ${opts.pt ? `<div class="feedback-detail-block"><div class="feedback-detail-label">Regra</div><div>${esc(opts.pt)}</div></div>` : ''}
          ${opts.wrongExample ? `<div class="feedback-detail-block"><div class="feedback-detail-label">Erro comum</div>
            <div class="feedback-compare"><span class="wrong">✗ ${esc(opts.wrongExample)}</span>${naturalMain ? `<span class="right">✓ ${esc(naturalMain)}</span>` : ''}</div></div>` : ''}
          <div class="feedback-detail-note">Isso vai reaparecer no seu Smart Review em breve — repetição é o que fixa.</div>
        </div>
      </details>` : '';
    return `<div class="feedback-panel-v2 ${opts.correct ? 'correct' : 'incorrect'}">
      <div class="feedback-title-v2">${title}</div>
      ${opts.pt ? `<div class="feedback-why">${esc(opts.pt)}</div>` : ''}
      ${naturalLine}
      ${altLine}
      ${xpLine}
      ${deepDive}
    </div>`;
  }

  return { panel };
})();
