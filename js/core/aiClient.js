/* FLUENTR — core/aiClient.js
   Thin client for the Gemini-backed Edge Functions (supabase/functions/).
   Every call goes through Supabase's Edge Functions gateway, which
   requires the anon key exactly like every other Supabase call this app
   makes — no separate secret lives here. Real cost/abuse protection is
   server-side (see supabase/functions/_shared/rateLimit.ts); this file
   just knows how to call the three endpoints and surface their errors. */

const FluentrAI = (function () {
  function isEnabled() {
    return !!(FL_CONFIG && FL_CONFIG.EDGE_FUNCTIONS_URL && FluentrSupabaseAuth.isEnabled());
  }

  async function call(fnName, body) {
    if (!isEnabled()) throw new Error('AI features need cloud sync configured (js/core/config.js).');
    const res = await fetch(`${FL_CONFIG.EDGE_FUNCTIONS_URL}/${fnName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FL_CONFIG.SUPABASE_ANON_KEY}`,
        'apikey': FL_CONFIG.SUPABASE_ANON_KEY
      },
      body: JSON.stringify(body)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `AI request failed (${res.status})`);
    return json;
  }

  // { reply, hadError, correction, correctionPt, remaining }
  function chat(profileId, scenario, level, history, message) {
    return call('ai-chat', { profileId, scenario, level, history, message });
  }

  // { issues: [{original, suggestion, type, pt}], overallPt, remaining }
  function reviewWriting(profileId, text) {
    return call('ai-writing-correct', { profileId, text });
  }

  // { exercises: [...], remaining, cached }
  function generateExercises(profileId, topic, level, count) {
    return call('ai-generate-exercises', { profileId, topic, level, count });
  }

  // Turns a raw error (a network TypeError, a Gemini API error blob passed
  // through by the Edge Function, our own rate-limit message, ...) into a
  // short PT message a non-technical reader can act on. Errors used to
  // reach the UI verbatim — e.g. a chat bubble showing
  // 'Gemini API error 503: {"error":{"code":503,...' — which is noise to
  // anyone but the developer.
  function friendlyError(e) {
    const msg = (e && e.message) || String(e || '');
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'Sem conexão com a internet. Verifique sua rede e tente de novo.';
    if (/failed to fetch|networkerror|load failed/i.test(msg)) return 'Não consegui conectar. Verifique sua internet e tente de novo.';
    if (/daily ai practice limit/i.test(msg)) return 'Vocês atingiram o limite diário de prática com IA. Volta amanhã!';
    if (/503|UNAVAILABLE|high demand|overloaded/i.test(msg)) return 'O serviço de IA está sobrecarregado agora. Tenta de novo em alguns segundos.';
    if (/gemini api error|blocked by safety filters/i.test(msg)) return 'Não consegui processar isso agora. Tenta de novo em instantes.';
    if (/cloud sync configured/i.test(msg)) return 'Esse recurso precisa da sincronização na nuvem ativada.';
    return 'Algo deu errado. Tenta de novo em instantes.';
  }

  return { isEnabled, chat, reviewWriting, generateExercises, friendlyError };
})();
