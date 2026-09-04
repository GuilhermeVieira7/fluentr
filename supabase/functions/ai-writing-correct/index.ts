// FLUENTR — AI Writing Coach.
// POST { profileId, text } -> { issues: [{original, suggestion, type, pt}], overallPt, remaining }
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { checkAndConsume } from '../_shared/rateLimit.ts';
import { geminiJSON } from '../_shared/gemini.ts';

const SYSTEM_INSTRUCTION = `You are an English writing coach for a Brazilian Portuguese speaker reviewing their own real work email/message. Find genuine grammar, naturalness, or tone issues — do not invent nitpicks in text that's already fine, and do not rewrite their voice/style unnecessarily.
For each real issue: quote the exact original snippet, give a corrected version, classify it (grammar | naturalness | tone), and explain briefly IN PORTUGUESE why (the way a patient teacher would, not a red pen).
Also give one short overall PT comment on the message as a whole (e.g. its tone, whether it's ready to send).
If the text has no real issues, return an empty issues array and a positive overallPt comment.
Respond with the required JSON shape only.`;

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const { profileId, text } = await req.json();
    if (!profileId || !text) return jsonResponse({ error: 'Missing profileId or text' }, 400);
    if (typeof text !== 'string' || text.length > 3000) return jsonResponse({ error: 'Text too long (max 3000 characters)' }, 400);
    if (!text.trim()) return jsonResponse({ error: 'Text is empty' }, 400);

    const { allowed, remaining } = await checkAndConsume(profileId);
    if (!allowed) return jsonResponse({ error: 'Daily AI practice limit reached — resets tomorrow.' }, 429);

    const result = await geminiJSON({
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [{ role: 'user', parts: [{ text }] }],
      responseSchema: {
        type: 'object',
        properties: {
          issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                original: { type: 'string' },
                suggestion: { type: 'string' },
                type: { type: 'string', enum: ['grammar', 'naturalness', 'tone'] },
                pt: { type: 'string' },
              },
              required: ['original', 'suggestion', 'type', 'pt'],
            },
          },
          overallPt: { type: 'string' },
        },
        required: ['issues', 'overallPt'],
      },
    });

    return jsonResponse({ ...(result as object), remaining });
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
