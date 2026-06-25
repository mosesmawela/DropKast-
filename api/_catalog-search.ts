import { logger } from './_logger.js';

export type SearchCategory = 'releases' | 'campaigns' | 'influencers' | 'splits' | 'anr' | 'promo' | 'pre_releases';

export interface SearchResult {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle?: string;
  score: number;
  match: string;
  metadata?: Record<string, unknown>;
}

export interface SearchOptions {
  query: string;
  categories?: SearchCategory[];
  limit?: number;
  minScore?: number;
  fuzzy?: boolean;
}

const MIN_SEARCH_LENGTH = 2;

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(/\s+/).filter(Boolean);
}

function scoreExact(term: string, target: string): number {
  const nterm = normalize(term);
  const ntarget = normalize(target);
  if (ntarget === nterm) return 100;
  if (ntarget.startsWith(nterm) || ntarget.endsWith(nterm)) return 80;
  if (ntarget.includes(nterm)) return 60;
  return 0;
}

function scoreTokens(term: string, target: string): number {
  const termTokens = tokenize(term);
  const targetTokens = tokenize(target);
  if (termTokens.length === 0 || targetTokens.length === 0) return 0;

  let totalScore = 0;
  for (const tt of termTokens) {
    let best = 0;
    for (const st of targetTokens) {
      const s = scoreExact(tt, st) * (tt.length / target.length);
      if (s > best) best = s;
    }
    totalScore += best;
  }
  return Math.round(totalScore / termTokens.length);
}

function scoreFuzzy(term: string, target: string): number {
  const nterm = normalize(term);
  const ntarget = normalize(target);
  if (nterm.length < MIN_SEARCH_LENGTH) return 0;
  if (Math.abs(nterm.length - ntarget.length) > 3) return 0;

  let matches = 0;
  const shorter = nterm.length < ntarget.length ? nterm : ntarget;
  const longer = nterm.length < ntarget.length ? ntarget : nterm;

  for (let i = 0; i < shorter.length; i++) {
    for (let j = Math.max(0, i - 1); j <= Math.min(longer.length - 1, i + 1); j++) {
      if (shorter[i] === longer[j]) { matches++; break; }
    }
  }

  return Math.round((matches / shorter.length) * 50);
}

export function searchItems(
  items: { id: string; title?: string; name?: string; artist?: string; category: SearchCategory; subtitle?: string; metadata?: Record<string, unknown> }[],
  query: string,
  options?: Partial<SearchOptions>,
): SearchResult[] {
  const opts: SearchOptions = {
    query,
    limit: options?.limit ?? 20,
    minScore: options?.minScore ?? 25,
    fuzzy: options?.fuzzy ?? true,
  };

  if (!query || query.length < MIN_SEARCH_LENGTH) return [];

  const results: SearchResult[] = [];
  const searchFields = ['title', 'name', 'artist', 'genre', 'description', 'label', 'platform'];

  for (const item of items) {
    let bestScore = 0;
    let bestMatch = '';

    for (const field of searchFields) {
      const value = (item as any)[field] || '';
      if (!value) continue;

      exact: {
        const s = scoreExact(query, value);
        if (s > bestScore) { bestScore = s; bestMatch = `${field}: exact`; }
      }
      token: {
        const s = scoreTokens(query, value);
        if (s > bestScore) { bestScore = s; bestMatch = `${field}: token`; }
      }
      fuzzy: {
        if (opts.fuzzy) {
          const s = scoreFuzzy(query, value);
          if (s > bestScore) { bestScore = s; bestMatch = `${field}: fuzzy`; }
        }
      }
    }

    if (bestScore >= opts.minScore!) {
      results.push({
        id: item.id,
        category: item.category,
        title: item.title || item.name || item.artist || 'Unknown',
        subtitle: item.subtitle,
        score: bestScore,
        match: bestMatch,
        metadata: item.metadata,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, opts.limit);
}

export interface SearchProvider {
  id: string;
  name: string;
  search(query: string, options?: Partial<SearchOptions>): Promise<SearchResult[]>;
}

type SearchableItem = {
  id: string; title?: string; name?: string; artist?: string;
  category: SearchCategory; subtitle?: string; metadata?: Record<string, unknown>;
};

export class MemorySearchProvider implements SearchProvider {
  id = 'memory';
  name = 'In-Memory Search';
  private items: SearchableItem[] = [];

  setItems(items: SearchableItem[]): void {
    this.items = items;
  }

  addItem(item: SearchableItem): void {
    this.items.push(item);
  }

  async search(query: string, options?: Partial<SearchOptions>): Promise<SearchResult[]> {
    return searchItems(this.items, query, options);
  }
}

export async function searchAll(
  providers: SearchProvider[],
  query: string,
  options?: Partial<SearchOptions>,
): Promise<Map<string, SearchResult[]>> {
  const results = new Map<string, SearchResult[]>();
  await Promise.all(
    providers.map(async (p) => {
      try {
        results.set(p.id, await p.search(query, options));
      } catch (err) {
        logger.error({ provider: p.id, err }, 'search: provider failed');
        results.set(p.id, []);
      }
    }),
  );
  return results;
}
