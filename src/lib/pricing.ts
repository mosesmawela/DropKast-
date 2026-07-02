/**
 * DropKast pricing tiers — single source of truth.
 *
 * Built from a 2026 competitive scan of all 10 major distros (DistroKid,
 * TuneCore, CD Baby, Ditto, Amuse, UnitedMasters, AWAL, RouteNote,
 * Symphonic, Repost). Strategy: undercut DistroKid Musician ($24.99) at
 * the Indie tier with ALL 10 AI studios bundled, undercut TuneCore Pro
 * ($54.99) at the Pro tier with uncapped AI + sync pitching.
 *
 * Key wedge: nobody else bundles AI mastering + mixing + artwork + video +
 * lyrics + advances + smart-links + splits in a single subscription.
 * Everyone else charges $5/track for mastering, $4.99/track for AI mixing,
 * etc. We bundle.
 */

export type TierId = 'free' | 'indie' | 'pro' | 'label';
export type BillingPeriod = 'monthly' | 'yearly';

export interface Tier {
  id: TierId;
  name: string;
  tagline: string;
  /** Yearly price in USD cents */
  yearlyCents: number;
  /** Monthly price in USD cents — when paid monthly (slight markup vs annual/12) */
  monthlyCents: number;
  /** Royalty cut DropKast keeps (0 = 100% to artist) */
  royaltyCutPct: number;
  /** Maximum artists allowed on this tier (null = unlimited) */
  maxArtists: number | null;
  /** Maximum releases per year (null = unlimited) */
  maxReleasesPerYear: number | null;
  /** Release lead time in days — how far ahead user must schedule */
  leadTimeDays: number;
  /** Support tier */
  supportLevel: 'community' | 'email-48h' | 'email-24h' | 'priority' | 'dedicated';
  /** Whether AI studios are uncapped */
  uncappedAi: boolean;
  /** Number of AI runs per month when capped (only used if !uncappedAi) */
  aiRunsPerMonth: number;
  /** Feature flags */
  features: {
    smartLinks: boolean;
    splits: boolean;
    advances: boolean;
    contentId: boolean;
    customLabel: boolean;
    hiResAudio: boolean;
    syncPitching: boolean;
    multiUser: boolean;
    whiteLabel: boolean;
    apiAccess: boolean;
    bulkUpload: boolean;
    dedicatedManager: boolean;
  };
  /** Stripe Price IDs — set when wired up. Until then, stub. */
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  /** Recommended badge */
  popular?: boolean;
  /** Badge color override */
  accentColor?: string;
}

export const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Try the platform. Upgrade when you\'re ready.',
    yearlyCents: 0,
    monthlyCents: 0,
    royaltyCutPct: 15,
    maxArtists: 1,
    maxReleasesPerYear: 2,
    leadTimeDays: 5,
    supportLevel: 'community',
    uncappedAi: false,
    aiRunsPerMonth: 3,
    features: {
      smartLinks: true,
      splits: true,
      advances: false,
      contentId: false,
      customLabel: false,
      hiResAudio: false,
      syncPitching: false,
      multiUser: false,
      whiteLabel: false,
      apiAccess: false,
      bulkUpload: false,
      dedicatedManager: false,
    },
  },
  {
    id: 'indie',
    name: 'Indie',
    tagline: 'For solo artists. Beats DistroKid Musician by $5 with 10× more bundled.',
    yearlyCents: 1_999,
    monthlyCents: 299,
    royaltyCutPct: 0,
    maxArtists: 1,
    maxReleasesPerYear: null,
    leadTimeDays: 14,
    supportLevel: 'email-48h',
    uncappedAi: false,
    aiRunsPerMonth: 50,
    features: {
      smartLinks: true,
      splits: true,
      advances: true,
      contentId: true,
      customLabel: false,
      hiResAudio: false,
      syncPitching: false,
      multiUser: false,
      whiteLabel: false,
      apiAccess: false,
      bulkUpload: false,
      dedicatedManager: false,
    },
    popular: true,
    accentColor: '#FF4D00',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Power users + small teams. The DistroKid Ultimate killer at 45% less.',
    yearlyCents: 4_999,
    monthlyCents: 599,
    royaltyCutPct: 0,
    maxArtists: 3,
    maxReleasesPerYear: null,
    leadTimeDays: 2,
    supportLevel: 'email-24h',
    uncappedAi: true,
    aiRunsPerMonth: 0, // ignored when uncapped
    features: {
      smartLinks: true,
      splits: true,
      advances: true,
      contentId: true,
      customLabel: true,
      hiResAudio: true,
      syncPitching: true,
      multiUser: false,
      whiteLabel: false,
      apiAccess: false,
      bulkUpload: false,
      dedicatedManager: false,
    },
    accentColor: '#FF4D00',
  },
  {
    id: 'label',
    name: 'Label',
    tagline: 'Multi-artist roster. Beats Ditto Label and Symphonic Partner.',
    yearlyCents: 14_999,
    monthlyCents: 1_499,
    royaltyCutPct: 0,
    maxArtists: 10, // 10 included, $12/yr per additional
    maxReleasesPerYear: null,
    leadTimeDays: 1,
    supportLevel: 'dedicated',
    uncappedAi: true,
    aiRunsPerMonth: 0,
    features: {
      smartLinks: true,
      splits: true,
      advances: true,
      contentId: true,
      customLabel: true,
      hiResAudio: true,
      syncPitching: true,
      multiUser: true,
      whiteLabel: true,
      apiAccess: true,
      bulkUpload: true,
      dedicatedManager: true,
    },
    accentColor: '#FF4D00',
  },
];

export const TIER_BY_ID: Record<TierId, Tier> = TIERS.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<TierId, Tier>,
);

/* =========================================================================
 * Per-additional-artist pricing for Label tier
 * ========================================================================= */
export const LABEL_EXTRA_ARTIST_YEARLY_CENTS = 1_200;

/* =========================================================================
 * Competitor comparison reference (used by /pricing page)
 * ========================================================================= */
export interface CompetitorEntry {
  name: string;
  url: string;
  cheapestPaidYearlyCents: number;
  topTierYearlyCents: number;
  royaltyCutPct: number;
  /** What % of comparable features are included vs DropKast Indie */
  bundledScore: number;
}

export const COMPETITORS: CompetitorEntry[] = [
  { name: 'DistroKid',     url: 'distrokid.com',      cheapestPaidYearlyCents: 2_499, topTierYearlyCents: 8_999, royaltyCutPct: 0,  bundledScore: 4 },
  { name: 'TuneCore',      url: 'tunecore.com',       cheapestPaidYearlyCents: 2_499, topTierYearlyCents: 5_499, royaltyCutPct: 0,  bundledScore: 5 },
  { name: 'Amuse',         url: 'amuse.io',           cheapestPaidYearlyCents: 2_399, topTierYearlyCents: 5_999, royaltyCutPct: 0,  bundledScore: 5 },
  { name: 'CD Baby',       url: 'cdbaby.com',         cheapestPaidYearlyCents: 999,   topTierYearlyCents: 0,    royaltyCutPct: 9,  bundledScore: 3 },
  { name: 'Ditto Music',   url: 'dittomusic.com',     cheapestPaidYearlyCents: 1_900, topTierYearlyCents: 31_900, royaltyCutPct: 0, bundledScore: 5 },
  { name: 'UnitedMasters', url: 'unitedmasters.com',  cheapestPaidYearlyCents: 1_999, topTierYearlyCents: 5_999, royaltyCutPct: 0,  bundledScore: 6 },
  { name: 'RouteNote',     url: 'routenote.com',      cheapestPaidYearlyCents: 999,   topTierYearlyCents: 999,  royaltyCutPct: 15, bundledScore: 2 },
  { name: 'Symphonic',     url: 'symphonic.com',      cheapestPaidYearlyCents: 1_999, topTierYearlyCents: 0,    royaltyCutPct: 0,  bundledScore: 5 },
  { name: 'AWAL',          url: 'awal.com',           cheapestPaidYearlyCents: 0,     topTierYearlyCents: 0,    royaltyCutPct: 15, bundledScore: 7 },
  { name: 'Repost (SC)',   url: 'repostnetwork.com',  cheapestPaidYearlyCents: 3_000, topTierYearlyCents: 0,    royaltyCutPct: 20, bundledScore: 4 },
];

/* =========================================================================
 * Feature comparison rows used on /pricing
 * ========================================================================= */
export interface FeatureRow {
  key: string;
  label: string;
  /** A human description for tooltip / details */
  description?: string;
  values: Record<TierId, string | boolean | number>;
}

export const FEATURE_MATRIX: FeatureRow[] = [
  {
    key: 'releases',
    label: 'Releases per year',
    values: { free: '2', indie: 'Unlimited', pro: 'Unlimited', label: 'Unlimited' },
  },
  {
    key: 'artists',
    label: 'Artist accounts',
    values: { free: '1', indie: '1', pro: '3', label: '10 (then $12/yr each)' },
  },
  {
    key: 'royalty',
    label: 'Royalty cut',
    values: { free: '15%', indie: '0% — you keep 100%', pro: '0%', label: '0%' },
  },
  {
    key: 'stores',
    label: 'Streaming services',
    values: { free: '165+', indie: '165+', pro: '165+', label: '165+' },
  },
  {
    key: 'lead',
    label: 'Release lead time',
    values: { free: '5 days', indie: '14 days', pro: '2 days', label: '1 day' },
  },
  {
    key: 'isrc-upc',
    label: 'ISRC + UPC auto-mint',
    values: { free: true, indie: true, pro: true, label: true },
  },
  {
    key: 'splits',
    label: 'Royalty splits + invite + auto-payout',
    values: { free: true, indie: true, pro: true, label: true },
  },
  {
    key: 'ai-splits',
    label: 'AI split-sheet analysis (global PROs, cited)',
    description: 'Grounded royalty breakdown across SAMRO, ASCAP/BMI, PRS, The MLC and more — with live sources.',
    values: { free: false, indie: true, pro: true, label: true },
  },
  {
    key: 'whatsapp',
    label: 'Submit music via WhatsApp',
    description: 'Conversational AI onboarding — submit a track straight from WhatsApp.',
    values: { free: true, indie: true, pro: true, label: true },
  },
  {
    key: 'smartlinks',
    label: 'Smart links / pre-saves',
    values: { free: true, indie: true, pro: true, label: true },
  },
  {
    key: 'ai-studios',
    label: 'AI Studios (10 tools)',
    values: {
      free: '1 only · 3 runs/mo',
      indie: 'All 10 · 50 runs/mo',
      pro: 'All 10 · uncapped',
      label: 'All 10 · uncapped',
    },
  },
  {
    key: 'advances',
    label: 'Royalty advances',
    values: { free: false, indie: true, pro: 'Higher caps', label: 'Highest caps' },
  },
  {
    key: 'content-id',
    label: 'YouTube Content ID',
    values: { free: false, indie: true, pro: true, label: true },
  },
  {
    key: 'custom-label',
    label: 'Custom label name',
    values: { free: false, indie: false, pro: true, label: true },
  },
  {
    key: 'hires',
    label: 'Hi-res / Dolby Atmos',
    values: { free: false, indie: false, pro: true, label: true },
  },
  {
    key: 'sync',
    label: 'Sync licensing pitch queue',
    values: { free: false, indie: false, pro: true, label: true },
  },
  {
    key: 'multi-user',
    label: 'Multi-user accounts + roles',
    values: { free: false, indie: false, pro: false, label: true },
  },
  {
    key: 'white-label',
    label: 'White-label artist dashboards',
    values: { free: false, indie: false, pro: false, label: true },
  },
  {
    key: 'api',
    label: 'API access + webhooks',
    values: { free: false, indie: false, pro: false, label: true },
  },
  {
    key: 'support',
    label: 'Support',
    values: {
      free: 'Community',
      indie: 'Email · 48h',
      pro: 'Email · 24h',
      label: 'Dedicated A&R',
    },
  },
];

/* =========================================================================
 * Helpers
 * ========================================================================= */
export function priceText(cents: number, period: BillingPeriod): string {
  if (cents === 0) return 'Free';
  const dollars = cents / 100;
  return `$${dollars.toFixed(2).replace(/\.00$/, '')}/${period === 'monthly' ? 'mo' : 'yr'}`;
}

export function yearlySavingsCents(tier: Tier): number {
  if (tier.yearlyCents === 0) return 0;
  return tier.monthlyCents * 12 - tier.yearlyCents;
}
