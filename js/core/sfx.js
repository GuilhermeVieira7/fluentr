/* FLUENTR — core/sfx.js
   Tiny sound + haptic feedback layer. Tones are synthesized with the Web
   Audio API (oscillator + gain envelope) — no audio files to ship or cache,
   a handful of lines instead of a binary asset pipeline. Vibration uses
   navigator.vibrate where supported (Android; iOS Safari has no
   vibration API at all — silently no-ops there, same graceful-absence
   pattern as the voice-input mic button). Toggle persists in
   localStorage — a device preference, not profile data. */

const FluentrSFX = (function () {
  let audioCtx = null;

  function ctx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    // Browsers start a fresh AudioContext 'suspended' until a user gesture
    // resumes it — every call site here is already inside a click handler,
    // so this resolves immediately in practice.
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => { });
    return audioCtx;
  }

  function tone(freq, duration, type, delay) {
    const c = ctx();
    if (!c) return;
    try {
      const start = c.currentTime + (delay || 0);
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    } catch (e) { /* ignore */ }
  }

  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* ignore */ }
  }

  function isEnabled() {
    try { return localStorage.getItem('fluentr_sfx') !== 'off'; } catch (e) { return true; }
  }
  function setEnabled(on) {
    try { localStorage.setItem('fluentr_sfx', on ? 'on' : 'off'); } catch (e) { /* ignore */ }
  }

  function correct() {
    if (!isEnabled()) return;
    tone(659, 0.11, 'sine', 0);
    tone(988, 0.14, 'sine', 0.08);
    vibrate(15);
  }

  function incorrect() {
    if (!isEnabled()) return;
    tone(196, 0.22, 'triangle', 0);
    vibrate([25, 35, 25]);
  }

  function levelUp() {
    if (!isEnabled()) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'sine', i * 0.09));
    vibrate([15, 25, 15, 25, 40]);
  }

  return { correct, incorrect, levelUp, isEnabled, setEnabled };
})();
