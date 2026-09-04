/* FLUENTR — core/presence.js
   "Practicing now" indicator via Supabase Realtime Presence — an ephemeral
   broadcast layer, not a database table: no writes, no rate limit, no
   polling. Presence is tracked for the whole app session (started
   alongside live sync in app.js) and cleared automatically when the tab
   closes or the socket drops, so it can't go stale the way a manual
   "last seen" timestamp in the database could. */

const FluentrPresence = (function () {
  let channel = null;
  let onlineIds = new Set();
  let onChange = null;

  function start(profileId, onChangeCb) {
    if (!FluentrSupabaseAuth.isEnabled() || channel) return;
    onChange = onChangeCb;
    channel = FluentrSupabaseAuth.getClient().channel('fluentr-presence', {
      config: { presence: { key: profileId } }
    });
    channel.on('presence', { event: 'sync' }, () => {
      onlineIds = new Set(Object.keys(channel.presenceState()));
      if (onChange) onChange();
    });
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await channel.track({ online_at: new Date().toISOString() });
    });
  }

  function isOnline(profileId) {
    return onlineIds.has(profileId);
  }

  function stop() {
    if (channel) { FluentrSupabaseAuth.getClient().removeChannel(channel); channel = null; }
    onlineIds = new Set();
    onChange = null;
  }

  return { start, isOnline, stop };
})();
