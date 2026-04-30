/**
 * Smart-link generation helper.
 *
 * Today: stores the link record in localStorage so the public /link/:slug
 * page can render it. Real impl will POST to /api/links and persist server-side.
 *
 * Slug format: short hash of releaseId + title — readable + unique.
 */

export interface SmartLinkPayload {
  id: string;            // slug
  releaseId: string;
  title: string;
  artist: string;
  artwork?: string;
  releaseDate?: string;
  tagline?: string;
  links: Record<string, string>;
  primaryColor?: string;
  socials?: { instagram?: string; tiktok?: string; twitter?: string; youtube?: string };
  createdAt: string;
}

/** Generate a short, URL-safe slug from a release id + title. */
export function makeSlug(releaseId: string, title: string): string {
  const t = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24);
  const id = releaseId.replace(/[^a-z0-9]+/gi, '').slice(-6).toLowerCase();
  return `${t}-${id}` || id || Math.random().toString(36).slice(2, 8);
}

export function saveSmartLink(p: SmartLinkPayload): void {
  try {
    localStorage.setItem(`dropkast.smartlink.${p.id}`, JSON.stringify(p));
    // Index by releaseId for the artist's "my links" list
    const idxRaw = localStorage.getItem('dropkast.smartlinks.index') || '[]';
    const idx = JSON.parse(idxRaw) as Array<{ slug: string; releaseId: string; title: string; createdAt: string }>;
    const existing = idx.findIndex((x) => x.slug === p.id);
    const entry = { slug: p.id, releaseId: p.releaseId, title: p.title, createdAt: p.createdAt };
    if (existing >= 0) idx[existing] = entry;
    else idx.unshift(entry);
    localStorage.setItem('dropkast.smartlinks.index', JSON.stringify(idx));
  } catch {/* ignore quota errors */}
}

export function listSmartLinks(): Array<{ slug: string; releaseId: string; title: string; createdAt: string }> {
  try {
    const raw = localStorage.getItem('dropkast.smartlinks.index') || '[]';
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function buildPublicUrl(slug: string): string {
  if (typeof window === 'undefined') return `/link/${slug}`;
  return `${window.location.origin}/link/${slug}`;
}

export function readSubscribers(slug: string): Array<{ email: string; at: number }> {
  try {
    return JSON.parse(localStorage.getItem(`dropkast.smartlink.${slug}.subs`) || '[]');
  } catch {
    return [];
  }
}

export function readClicks(slug: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(`dropkast.smartlink.${slug}.clicks`) || '{}');
  } catch {
    return {};
  }
}
