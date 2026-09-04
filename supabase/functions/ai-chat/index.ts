// FLUENTR — AI Conversation Practice.
// POST { profileId, scenario, level, history: [{role, text}], message }
// -> { reply, hadError, correction, correctionPt, remaining }
//
// The scenario persona is chosen server-side from a fixed list (SCENARIOS
// below) — the client sends only a scenario *id*, never free-form
// instructions. That's a deliberate cost/abuse guard: if the client could
// inject arbitrary system-prompt text, someone could turn this into a
// free-form Gemini proxy for anything, burning the shared daily quota on
// things that have nothing to do with English practice.
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { checkAndConsume } from '../_shared/rateLimit.ts';
import { geminiJSON } from '../_shared/gemini.ts';

const SCENARIOS: Record<string, string> = {
  'job-interview': 'You are a friendly but professional interviewer at a mid-size tech company, interviewing the user for a software role. Ask one interview question at a time, react naturally to their answer, then ask a sensible follow-up.',
  'team-meeting': 'You are the user\'s teammate in a weekly work sync. Discuss project status naturally, ask about blockers, and react to what they say like a real coworker would.',
  'small-talk': 'You are a friendly coworker chatting with the user at the office coffee machine. Keep it light, casual, and natural — weekend plans, weather, weekend recap, that kind of thing.',
  'negotiation': 'You are a vendor/client the user is negotiating a deadline or price with. Be reasonable but firm — push back a little before compromising, like a real negotiation.',
  'customer-support': 'You are a customer contacting the user (a support agent) with a technical problem. Describe a plausible, moderately confusing issue and react to their troubleshooting.',
  'networking-event': 'You are another attendee at a professional networking event. Make natural small talk that could lead into a professional conversation.',
};

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json();
    const { profileId, scenario, level, history, message } = body;
    if (!profileId || !scenario || !message) return jsonResponse({ error: 'Missing profileId, scenario, or message' }, 400);
    const persona = SCENARIOS[scenario];
    if (!persona) return jsonResponse({ error: `Unknown scenario "${scenario}"` }, 400);
    if (typeof message !== 'string' || message.length > 1000) return jsonResponse({ error: 'Message too long' }, 400);

    const { allowed, remaining } = await checkAndConsume(profileId);
    if (!allowed) return jsonResponse({ error: 'Daily AI practice limit reached — resets tomorrow.' }, 429);

    const systemInstruction = `${persona}
The user's approximate English level is ${level || 'B1'} (CEFR). Keep your in-character reply natural but not overly complex for that level — 1-3 sentences, like real spoken/written English, not a textbook.
Separately, check the user's LAST message (not the whole history) for a clear grammar or naturalness mistake. If there's a genuine issue, set hadError true and fill correction (the corrected English) and correctionPt (a short, friendly explanation IN PORTUGUESE of what was off and why — like a patient teacher, not a red pen). If their message was already natural, set hadError false and leave correction/correctionPt null.
Always respond with the required JSON shape only.`;

    const contents = [
      ...(Array.isArray(history) ? history.slice(-12) : []).map((h: { role: string; text: string }) => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(h.text).slice(0, 1000) }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const result = await geminiJSON({
      systemInstruction,
      contents,
      responseSchema: {
        type: 'object',
        properties: {
          reply: { type: 'string' },
          hadError: { type: 'boolean' },
          correction: { type: 'string', nullable: true },
          correctionPt: { type: 'string', nullable: true },
        },
        required: ['reply', 'hadError'],
      },
    }) as { reply: string; hadError: boolean; correction?: string | null; correctionPt?: string | null };

    return jsonResponse({ ...result, remaining });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
