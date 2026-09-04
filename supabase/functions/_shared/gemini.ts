// FLUENTR — thin Gemini API wrapper. GEMINI_API_KEY is a Supabase secret
// (Edge Functions → Manage secrets) — never sent to or readable by the
// client. Uses responseSchema/responseMimeType so Gemini returns strict
// JSON matching the shape each caller needs, instead of free text we'd
// have to parse hopefully.
const MODEL = 'gemini-3.6-flash';

export async function geminiJSON(opts: {
  systemInstruction: string;
  contents: { role: 'user' | 'model'; parts: { text: string }[] }[];
  responseSchema: Record<string, unknown>;
}): Promise<unknown> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: opts.systemInstruction }] },
        contents: opts.contents,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: opts.responseSchema,
          temperature: 0.7,
        },
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini API error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no content (likely blocked by safety filters)');
  return JSON.parse(text);
}
