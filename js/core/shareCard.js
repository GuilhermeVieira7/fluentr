/* FLUENTR — core/shareCard.js
   Generates a shareable PNG (streak + stats, Fluentr-branded) with plain
   Canvas 2D — no image/library dependency — and hands it to the OS share
   sheet (WhatsApp/Instagram/etc via the Web Share API's file support) with
   a same-origin download as the fallback for browsers without it. */

const FluentrShareCard = (function () {
  const W = 1080, H = 1350;

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function radialBlob(ctx, x, y, r, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  async function drawStreakCard(profile, couple) {
    // Web fonts may still be loading the first time this runs — without
    // waiting, the card can render one frame with the fallback system font,
    // which toBlob() would capture and ship out looking off-brand.
    if (document.fonts && document.fonts.ready) { await document.fonts.ready.catch(() => {}); }

    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0d132b');
    bg.addColorStop(0.55, '#2a1f5c');
    bg.addColorStop(1, '#1948c9');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    radialBlob(ctx, W * 0.88, H * 0.1, 380, 'rgba(0,212,179,0.32)');
    radialBlob(ctx, W * 0.08, H * 0.94, 420, 'rgba(255,91,174,0.26)');

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 42px Sora, sans-serif';
    ctx.fillText('⚡ FLUENTR', 68, 104);

    // Avatar
    const cx = W / 2, avatarY = 300, avatarR = 92;
    let avatarDrawn = false;
    if (profile.photo && profile.photo.dataUrl) {
      const img = await loadImage(profile.photo.dataUrl);
      if (img) {
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, avatarY, avatarR, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
        ctx.drawImage(img, cx - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
        ctx.restore();
        avatarDrawn = true;
      }
    }
    if (!avatarDrawn) {
      ctx.fillStyle = profile.color || '#5b3df5';
      ctx.beginPath(); ctx.arc(cx, avatarY, avatarR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '800 64px Sora, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const initials = (profile.name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
      ctx.fillText(initials, cx, avatarY + 6);
      ctx.textBaseline = 'alphabetic';
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(cx, avatarY, avatarR + 14, 0, Math.PI * 2); ctx.stroke();

    // Big streak number
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd60a';
    ctx.font = '800 168px Sora, sans-serif';
    ctx.fillText(`🔥 ${profile.streak.current}`, cx, 630);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 46px Manrope, sans-serif';
    const dayWord = profile.streak.current === 1 ? 'dia' : 'dias';
    ctx.fillText(`${profile.name} está com uma ofensiva`, cx, 706);
    ctx.fillText(`de ${profile.streak.current} ${dayWord} no Fluentr!`, cx, 762);

    // Stat row
    const statsY = 900;
    const level = FluentrGamification.levelInfo(profile.xp).level;
    const stats = [[String(profile.xp), 'XP total'], [String(level), 'Nível'], [String(profile.streak.best), 'Recorde']];
    const colW = W / 3;
    stats.forEach(([val, label], i) => {
      const x = colW * i + colW / 2;
      ctx.font = '800 54px Sora, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(val, x, statsY);
      ctx.font = '600 25px Manrope, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.fillText(label, x, statsY + 38);
    });

    if (couple && couple.streak && couple.streak.current > 0) {
      ctx.font = '700 34px Manrope, sans-serif';
      ctx.fillStyle = '#ff9fce';
      ctx.fillText(`❤️🔥 ${couple.streak.current} dias aprendendo juntos`, cx, 1040);
    }

    ctx.font = '600 24px Manrope, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('Inglês de verdade, todo dia', cx, H - 60);

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  }

  // 'shared' | 'downloaded' | 'cancelled'
  async function shareStreakCard(profile, couple) {
    const blob = await drawStreakCard(profile, couple);
    if (!blob) throw new Error('Could not render the card.');
    const filename = `fluentr-streak-${profile.id}-${profile.streak.current}d.png`;
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file], title: 'Fluentr',
          text: `${profile.name} está com uma ofensiva de ${profile.streak.current} dias no Fluentr! 🔥`
        });
        return 'shared';
      } catch (e) {
        if (e && e.name === 'AbortError') return 'cancelled';
        // fall through to a plain download if the share sheet itself errored
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    return 'downloaded';
  }

  return { shareStreakCard };
})();
