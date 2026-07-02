/**
 * AI Split-Sheet generator — grounded royalty analysis.
 *
 * Ported + globalised from the standalone ai-split-sheet-generator. Uses Gemini
 * with the Google Search tool so the royalty rules it cites are researched live
 * (SAMRO/CAPASSO/SAMPRA, ASCAP/BMI/SESAC/GMR, The MLC/HFA, SoundExchange,
 * PRS/MCPS/PPL and other international CMOs) rather than hallucinated.
 *
 * Requires GOOGLE_API_KEY in the server env. No key ever ships to the browser.
 */
import { GoogleGenAI } from '@google/genai';

export interface SplitContributor {
  name: string;
  roles: string[];
  percentage: number;
}

export interface SplitSource {
  title: string;
  uri: string;
}

export class SplitSheetError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

const MODEL = process.env.GEMINI_SPLIT_MODEL || 'gemini-2.5-flash';

function buildPrompt(songTitle: string, contributors: SplitContributor[]): string {
  const rows = contributors
    .map((c) => `- ${c.name}: ${(c.roles || []).join(', ') || 'Contributor'} (${c.percentage}%)`)
    .join('\n');
  const total = contributors.reduce((s, c) => s + (Number(c.percentage) || 0), 0);

  return `
You are an expert global music-royalties advisor. Use the Google Search tool to
find the MOST RECENT, accurate royalty rules, standard split conventions, and
eligibility criteria from the relevant collection societies, then produce a
clear split-sheet analysis for the song below.

SONG TITLE: ${songTitle || 'Untitled'}

CONTRIBUTORS (declared shares total ${total}%):
${rows || '- (none provided)'}

RESEARCH & COVER THESE BY REGION (only detail the ones relevant to the roles present, but always mention the region set):
- South Africa: SAMRO (performing rights), CAPASSO (mechanical), SAMPRA (needletime / neighbouring rights).
- United States: ASCAP / BMI / SESAC / GMR (public performance of the composition), The MLC + HFA (mechanical, incl. streaming mechanical), SoundExchange (digital performance / neighbouring rights on the master).
- United Kingdom / Europe: PRS for Music & MCPS (composition), PPL (neighbouring rights on the master).
- Note major international CMOs where relevant (SACEM, GEMA, APRA AMCOS, etc.).

FOR THE ANALYSIS, PROVIDE:
1. **Composition vs Master split** — separate the songwriting/publishing (composition) side from the recording (master) side. Explain which contributors sit on which side based on their roles.
2. **Writer share vs Publisher share** — the classic split of the composition, and how it flows through a PRO + mechanical society.
3. **Per-society breakdown** — for each relevant society: what it collects, which listed contributors are eligible (by role), and the recommended share. Cite the standard rule you found (e.g. "SAMRO/most PROs split the performance royalty 50% writer / 50% publisher").
4. **Validation** — if the declared shares do not total 100%, flag it and suggest a balanced split.
5. **Action checklist** — what each contributor should register and where, plus ISRC (master) vs ISWC (composition) reminders.

FORMATTING (strict Markdown):
- ## for main section headings, ### for subsections.
- **bold** for key terms, - for bullets, tables allowed.
- Be concrete with numbers. Keep it practical for an independent artist.
`;
}

export async function generateSplitSheet(
  songTitle: string,
  contributors: SplitContributor[],
): Promise<{ text: string; sources: SplitSource[]; model: string }> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new SplitSheetError(
      'GOOGLE_API_KEY is not configured on the server. Add it to enable grounded split-sheet analysis.',
      401,
    );
  }
  if (!Array.isArray(contributors) || contributors.length === 0) {
    throw new SplitSheetError('At least one contributor is required.', 400);
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: buildPrompt(songTitle, contributors),
      config: { tools: [{ googleSearch: {} }] },
    });

    const text = response.text || '';
    const sources: SplitSource[] =
      (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri && web.title)
        .map((web: any) => ({ title: web.title as string, uri: web.uri as string })) || [];

    // De-dup sources by uri
    const seen = new Set<string>();
    const uniqueSources = sources.filter((s) => (seen.has(s.uri) ? false : (seen.add(s.uri), true)));

    if (!text.trim()) throw new SplitSheetError('The model returned an empty analysis. Try again.', 502);
    return { text, sources: uniqueSources, model: MODEL };
  } catch (e: any) {
    if (e instanceof SplitSheetError) throw e;
    const msg = String(e?.message || e);
    // Surface auth/quota errors with a sensible status
    const status = /api key|permission|401|403/i.test(msg) ? 401 : /quota|429|rate/i.test(msg) ? 429 : 502;
    throw new SplitSheetError(`Split-sheet generation failed: ${msg.slice(0, 200)}`, status);
  }
}
