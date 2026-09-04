// FLUENTR — Infinite personalized content.
// POST { profileId, topic, level, count } -> { exercises: [...], remaining }
// Checks the shared cache (public.generated_exercises) first — a topic
// either partner has already generated exercises for is served straight
// from Postgres, no Gemini call, no rate-limit cost. Only the shortfall
// (if the cache has fewer than `count` items for this topic+level) goes
// to Gemini, and the new ones are cached for next time.
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { checkAndConsume, serviceClient } from '../_shared/rateLimit.ts';
import { geminiJSON } from '../_shared/gemini.ts';

const SYSTEM_INSTRUCTION = `You write English-learning exercises for a Brazilian Portuguese speaker, in the exact style of a Duolingo-like app focused on REAL, natural English (not textbook phrasing) — each item teaches one specific natural-vs-awkward distinction.
For each exercise: a multiple-choice question with exactly 3 options (one correct, two plausible-but-wrong distractors — not silly/obviously-wrong ones), the correct answer's index (0-2), a short English explanation of why the correct one is right, and a "pt" field — a short, warm explanation IN PORTUGUESE of the specific reason a Brazilian speaker would get this wrong or find it non-obvious (a false friend, a preposition that doesn't map from Portuguese, an idiom, a register/tone mismatch, etc).
Vary the exercise type field across "mc" (a workplace/professional-life multiple choice scenario) and "fill" (fill-in-the-blank testing one specific word/preposition) roughly evenly.
Respond with the required JSON shape only.`;

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const { profileId, topic, level, count } = await req.json();
    if (!profileId || !topic) return jsonResponse({ error: 'Missing profileId or topic' }, 400);
    if (typeof topic !== 'string' || topic.length > 80) return jsonResponse({ error: 'Invalid topic' }, 400);
    const wanted = Math.max(1, Math.min(10, Number(count) || 5));
    const lvl = typeof level === 'string' && level.length <= 4 ? level : 'B1';

    const sb = serviceClient();
    const { data: cached } = await sb
      .from('generated_exercises')
      .select('id, data')
      .eq('topic', topic).eq('level', lvl)
      .order('used_count', { ascending: true })
      .limit(wanted);

    const have = cached || [];
    if (have.length >= wanted) {
      return jsonResponse({ exercises: have.map((r) => ({ id: r.id, ...(r.data as object) })), remaining: null, cached: true });
    }

    const missing = wanted - have.length;
    const { allowed, remaining } = await checkAndConsume(profileId);
    if (!allowed) {
      // Cache had *some* items — better to return those than a hard error.
      if (have.length) return jsonResponse({ exercises: have.map((r) => ({ id: r.id, ...(r.data as object) })), remaining: 0, cached: true });
      return jsonResponse({ error: 'Daily AI practice limit reached — resets tomorrow.' }, 429);
    }

    const generated = await geminiJSON({
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [{ role: 'user', parts: [{ text: `Topic: "${topic}". CEFR level: ${lvl}. Generate ${missing} exercises.` }] }],
      responseSchema: {
        type: 'object',
        properties: {
          exercises: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['mc', 'fill'] },
                question: { type: 'string' },
                options: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
                answer: { type: 'integer' },
                explanation: { type: 'string' },
                pt: { type: 'string' },
              },
              required: ['type', 'question', 'options', 'answer', 'explanation', 'pt'],
            },
          },
        },
        required: ['exercises'],
      },
    }) as { exercises: Array<Record<string, unknown>> };

    const rows = generated.exercises.map((ex) => ({
      id: `gen-${crypto.randomUUID()}`,
      topic, level: lvl,
      data: { ...ex, category: ex.type === 'fill' ? 'Complete the sentence' : 'Multiple Choice' },
    }));
    if (rows.length) await sb.from('generated_exercises').insert(rows);

    const all = [...have.map((r) => ({ id: r.id, ...(r.data as object) })), ...rows.map((r) => ({ id: r.id, ...r.data }))];
    return jsonResponse({ exercises: all, remaining, cached: false });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
