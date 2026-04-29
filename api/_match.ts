/**
 * Phase 4 — real influencer matching algorithm.
 *
 * Replaces the previous `db.influencers.slice(0, 2)` placeholder with
 * actual scoring. No external embeddings model needed (saves $$); uses
 * cheap deterministic scoring on metadata that's already in the roster:
 *   - genre overlap (string similarity)
 *   - reach (parsed from strings like "1.2M", "850K")
 *   - match score (existing percentage on the influencer record)
 *   - platform fit per release type
 *
 * When you wire embeddings later (OpenAI / Voyage AI), swap this for a
 * cosine-similarity sort over `influencer.bio_embedding × release.tag_embedding`.
 */

export interface ReleaseLite {
  id: string;
  title?: string;
  artist?: string;
  genre?: string;
  metadata?: Record<string, unknown>;
}

export interface InfluencerLite {
  id: string;
  name: string;
  platform?: string;
  reach?: string;            // e.g. "1.2M", "450K"
  genre?: string;            // primary genre tag
  match?: string;            // existing manual score "98%"
  status?: string;
  avatar?: string;
  [key: string]: unknown;
}

export interface ScoredInfluencer extends InfluencerLite {
  score: number;             // 0-100 blended
  reasons: string[];         // why this person scored this way (transparency)
  reachNum: number;          // parsed reach in raw integer
}

const PLATFORM_WEIGHT_BY_GENRE: Record<string, Record<string, number>> = {
  // Tighten or loosen these based on internal data once we have it.
  'hyperpop':       { tiktok: 1.4, instagram: 1.0, youtube: 0.7 },
  'pop':            { tiktok: 1.2, instagram: 1.1, youtube: 1.0 },
  'amapiano':       { tiktok: 1.4, instagram: 1.1, youtube: 0.9 },
  'afrohouse':      { tiktok: 1.2, instagram: 1.2, youtube: 1.0 },
  'r&b':            { tiktok: 1.0, instagram: 1.1, youtube: 1.2 },
  'hip-hop':        { tiktok: 1.3, instagram: 1.1, youtube: 1.1 },
  'dance':          { tiktok: 1.2, instagram: 1.0, youtube: 0.9 },
  'electronic':     { tiktok: 1.1, instagram: 1.0, youtube: 1.0 },
  'indie':          { tiktok: 1.0, instagram: 1.1, youtube: 1.2 },
};

const GENRE_FAMILIES: Record<string, string[]> = {
  // Anything in the right family gets a partial-credit genre match.
  'hyperpop':   ['hyperpop', 'pop', 'electronic', 'dance'],
  'pop':        ['pop', 'hyperpop', 'r&b'],
  'amapiano':   ['amapiano', 'afrohouse', 'afro-fusion', 'dance', 'electronic'],
  'afrohouse':  ['afrohouse', 'amapiano', 'house', 'electronic', 'dance'],
  'r&b':        ['r&b', 'soul', 'pop', 'hip-hop'],
  'hip-hop':    ['hip-hop', 'rap', 'trap', 'r&b'],
  'electronic': ['electronic', 'dance', 'house', 'techno', 'hyperpop'],
  'dance':      ['dance', 'electronic', 'house', 'amapiano'],
  'indie':      ['indie', 'pop', 'rock', 'folk'],
};

/** Parse "1.2M", "850K", "10000" into raw integer. */
export function parseReach(reach: string | undefined): number {
  if (!reach) return 0;
  const s = String(reach).trim().toUpperCase().replace(/[, ]/g, '');
  const num = parseFloat(s);
  if (Number.isNaN(num)) return 0;
  if (s.endsWith('M')) return Math.round(num * 1_000_000);
  if (s.endsWith('K')) return Math.round(num * 1_000);
  if (s.endsWith('B')) return Math.round(num * 1_000_000_000);
  return Math.round(num);
}

function genreScore(releaseGenre: string | undefined, infGenre: string | undefined): { score: number; reason?: string } {
  if (!releaseGenre || !infGenre) return { score: 0.4 };  // neutral
  const r = releaseGenre.toLowerCase().trim();
  const i = infGenre.toLowerCase().trim();
  if (r === i) return { score: 1.0, reason: `Exact genre match (${i})` };
  // Family fallback
  const family = GENRE_FAMILIES[r] ?? [];
  if (family.includes(i)) return { score: 0.7, reason: `Genre family fit (${i} in ${r} family)` };
  return { score: 0.2 };
}

function platformScore(releaseGenre: string | undefined, infPlatform: string | undefined): number {
  if (!releaseGenre || !infPlatform) return 1.0;
  const r = releaseGenre.toLowerCase().trim();
  const p = infPlatform.toLowerCase().trim();
  return PLATFORM_WEIGHT_BY_GENRE[r]?.[p] ?? 1.0;
}

function reachScore(reach: number): number {
  // Log-scaled bonus: we like big reach but with diminishing returns.
  // Micro-influencers (10K-100K) often beat mega for music conversion,
  // so we tier rather than rewarding pure volume.
  if (reach >= 5_000_000) return 0.9;            // mega — saturation risk
  if (reach >= 1_000_000) return 1.0;            // sweet spot
  if (reach >= 250_000) return 0.95;             // strong macro
  if (reach >= 50_000) return 0.85;              // micro-influencer (high engagement)
  if (reach >= 10_000) return 0.7;
  if (reach >= 1_000) return 0.45;
  return 0.2;
}

function manualMatchScore(matchStr: string | undefined): number {
  if (!matchStr) return 0.7;  // neutral default
  const num = parseInt(String(matchStr).replace(/[^0-9]/g, ''), 10);
  if (Number.isNaN(num)) return 0.7;
  return Math.min(1.0, Math.max(0, num / 100));
}

/**
 * Score and rank a roster against a release.
 * Returns a sorted array (best first) with reasoning so the UI can
 * explain why each match was made.
 */
export function matchInfluencers(
  release: ReleaseLite,
  roster: InfluencerLite[],
  options: { limit?: number; minScore?: number } = {},
): ScoredInfluencer[] {
  const { limit = 12, minScore = 30 } = options;
  const scored: ScoredInfluencer[] = roster.map((inf) => {
    const reasons: string[] = [];
    const g = genreScore(release.genre, inf.genre);
    if (g.reason) reasons.push(g.reason);
    const p = platformScore(release.genre, inf.platform);
    if (p > 1.05) reasons.push(`${inf.platform} is the strong format for ${release.genre}`);
    const reachNum = parseReach(inf.reach);
    const r = reachScore(reachNum);
    if (reachNum >= 50_000 && reachNum < 250_000) {
      reasons.push('Micro-influencer — historically higher engagement per stream');
    } else if (reachNum >= 1_000_000 && reachNum < 5_000_000) {
      reasons.push('Macro-influencer in conversion sweet spot');
    }
    const m = manualMatchScore(inf.match);

    // Blended score: genre is the biggest lever, then reach, then manual notes, then platform.
    const blended = (g.score * 0.45 + r * 0.25 + m * 0.20 + (p - 1) * 0.10 + 0.10) * 100;
    const score = Math.round(Math.min(100, Math.max(0, blended)));

    return { ...inf, score, reasons, reachNum };
  });

  return scored
    .filter((s) => s.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
