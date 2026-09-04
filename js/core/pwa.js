/* FLUENTR — core/pwa.js
   Service worker registration + install-prompt capture. Kept isolated so
   app.js doesn't need to know anything about the install flow's mechanics. */

const FluentrPWA = (function () {
  let deferredPrompt = null;
  let onInstallableChange = null;
  // Once the native prompt has been shown and dismissed, Chrome typically
  // won't fire beforeinstallprompt again for a good while — without this,
  // installState() would silently fall back to 'unsupported' (nothing
  // rendered) right after a dismiss, which reads as "the button broke"
  // rather than "you said not now." Fall back to manual instructions
  // instead of just disappearing.
  let promptDismissedOnce = false;

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch((err) => {
        console.warn('[Fluentr] Service worker registration failed:', err);
      });
    });
  }

  function listenForInstallPrompt(callback) {
    onInstallableChange = callback;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      promptDismissedOnce = false;
      if (onInstallableChange) onInstallableChange(true);
    });
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      if (onInstallableChange) onInstallableChange(false);
    });
  }

  async function promptInstall() {
    if (!deferredPrompt) return 'unavailable';
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (choice.outcome === 'dismissed') promptDismissedOnce = true;
    if (onInstallableChange) onInstallableChange(false);
    return choice.outcome; // 'accepted' | 'dismissed'
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  // iOS/iPadOS Safari never fires `beforeinstallprompt` — there is no
  // programmatic install API there at all, only the manual Share → Add to
  // Home Screen flow. Detected via UA rather than feature-testing because
  // there's no reliable capability check for "is this iOS Safari."
  function isIOS() {
    const ua = navigator.userAgent || '';
    const iPadOS13Plus = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1; // iPadOS reports as Mac
    return /iPad|iPhone|iPod/.test(ua) || iPadOS13Plus;
  }

  // One state to drive the Settings "Install" row instead of scattering
  // these checks across ui.js/app.js: 'installed' | 'promptable' |
  // 'ios-manual' | 'manual-fallback' | 'unsupported'.
  function installState() {
    if (isStandalone()) return 'installed';
    if (deferredPrompt) return 'promptable';
    if (isIOS()) return 'ios-manual';
    if (promptDismissedOnce) return 'manual-fallback';
    return 'unsupported';
  }

  /* ============ Local notifications ============
     Honest scope: this is the Notification API, checked when the app is
     opened/foregrounded — not a real push subscription (that needs a
     server to wake the service worker while the app is fully closed,
     which this local-first build doesn't have). It still catches the
     common case: opening the app and getting reminded before closing it. */

  function notificationsSupported() {
    return 'Notification' in window;
  }

  async function requestNotificationPermission() {
    if (!notificationsSupported()) return 'unsupported';
    return Notification.requestPermission();
  }

  function notificationPermission() {
    return notificationsSupported() ? Notification.permission : 'unsupported';
  }

  // Fires at most once per day per profile, only if permission is already
  // granted (never prompts here — that only happens from the Settings toggle).
  function maybeNotify(profileId, title, body) {
    if (!notificationsSupported() || Notification.permission !== 'granted') return;
    const key = `fluentr_notified_${profileId}_${flTodayISO()}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, '1');
    } catch (e) { /* ignore */ }
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.showNotification) reg.showNotification(title, { body, icon: 'assets/icons/icon-192.png', tag: 'fluentr-reminder' });
        else new Notification(title, { body, icon: 'assets/icons/icon-192.png' });
      }).catch(() => new Notification(title, { body, icon: 'assets/icons/icon-192.png' }));
    } else {
      new Notification(title, { body, icon: 'assets/icons/icon-192.png' });
    }
  }

  return {
    registerServiceWorker, listenForInstallPrompt, promptInstall, isStandalone, isIOS, installState,
    notificationsSupported, requestNotificationPermission, notificationPermission, maybeNotify
  };
})();
