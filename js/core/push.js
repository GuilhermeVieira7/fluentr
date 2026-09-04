/* FLUENTR — core/push.js
   Real Web Push subscriptions — unlike core/pwa.js's maybeNotify (which
   only fires while the app is open), this reaches the device even when
   the browser is fully closed, via supabase/functions/send-daily-reminders
   triggered by pg_cron. Only meaningful when Supabase is configured (needs
   somewhere server-side to store the subscription and trigger sends). */

const FluentrPush = (function () {
  function isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
  }

  async function currentSubscription() {
    const reg = await navigator.serviceWorker.ready;
    return reg.pushManager.getSubscription();
  }

  async function isSubscribed() {
    if (!isSupported()) return false;
    return !!(await currentSubscription());
  }

  // Requests Notification permission (if needed), subscribes this device
  // via the browser's push service, and stores the subscription in
  // Supabase so send-daily-reminders can find it. Returns true on success.
  async function subscribe(profileId) {
    if (!isSupported() || !FluentrSupabaseAuth.isEnabled()) return false;
    if (Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return false;
    }
    if (Notification.permission !== 'granted') return false;

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(FL_CONFIG.VAPID_PUBLIC_KEY)
      });
    }
    const json = sub.toJSON();
    const { error } = await FluentrSupabaseAuth.getClient().from('push_subscriptions').insert({
      profile_id: profileId,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth
    });
    // A duplicate endpoint (already subscribed) violates the unique
    // constraint — that's success, not failure, so only bail on other errors.
    if (error && error.code !== '23505') throw error;
    return true;
  }

  async function unsubscribe() {
    const sub = await currentSubscription();
    if (!sub) return;
    const endpoint = sub.endpoint;
    await sub.unsubscribe();
    if (FluentrSupabaseAuth.isEnabled()) {
      await FluentrSupabaseAuth.getClient().from('push_subscriptions').delete().eq('endpoint', endpoint);
    }
  }

  // Immediate push to the OTHER profile's devices — e.g. "it's your turn"
  // when a Duel round is submitted. Best-effort: swallows failures (a
  // missing notification isn't worth surfacing an error over) and no-ops
  // silently when cloud sync isn't configured.
  async function notifyProfile(profileId, title, body) {
    if (!FluentrAI.isEnabled()) return;
    try {
      await fetch(`${FL_CONFIG.EDGE_FUNCTIONS_URL}/send-push-to-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FL_CONFIG.SUPABASE_ANON_KEY}`,
          'apikey': FL_CONFIG.SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ profileId, title, body })
      });
    } catch (e) { /* best-effort */ }
  }

  return { isSupported, isSubscribed, subscribe, unsubscribe, notifyProfile };
})();
