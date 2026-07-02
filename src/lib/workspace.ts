/**
 * Workspace customization — let artists hide/show modules they don't use.
 *
 * Some artists only want distribution + earnings. Others want the AI/UGC suite,
 * the influencer relay, and DJ packs all turned on. We let them pick.
 *
 * This is the single source of truth for "which modules exist." The Sidebar
 * reads from here, the Settings page reads from here, and the WorkspaceContext
 * persists the user's selection in localStorage.
 */

export type ModuleId =
  | 'home'
  | 'messages'
  | 'pre-release'
  | 'campaigns'
  | 'influencers'
  | 'dj-packs'
  | 'reactions'
  | 'social-ads'
  | 'splits'
  | 'analytics'
  | 'earnings'
  | 'assets'
  | 'ai-providers'
  | 'academy'
  | 'platforms'
  | 'compliance'
  | 'releases'
  | 'smart-links'
  | 'advances'
  | 'studios'
  | 'trending'
  | 'admin'
  | 'settings'
  | 'publishing'
  | 'video'
  | 'marketing';

export type ModuleCategory = 'core' | 'ai-tools' | 'creators' | 'business';

export interface ModuleDef {
  id: ModuleId;
  label: string;
  path: string;
  category: ModuleCategory;
  description: string;
  /** Required modules can never be turned off (auth/identity-critical) */
  required?: boolean;
  /** Recommended for first-time users */
  defaultOn?: boolean;
}

export const MODULES: ModuleDef[] = [
  // CORE — always on, can't be disabled
  { id: 'home',         label: 'Home',         path: '/dashboard',     category: 'core',     description: 'Your dashboard.', required: true,  defaultOn: true },
  { id: 'releases',     label: 'Releases',     path: '/releases',      category: 'core',     description: 'Manage your music catalogue.', required: true,  defaultOn: true },
  { id: 'settings',     label: 'Settings',     path: '/settings',      category: 'core',     description: 'Account and workspace.', required: true,  defaultOn: true },

  // CORE — recommended
  { id: 'messages',     label: 'Messages',     path: '/messages',      category: 'core',     description: 'Conversations with influencers, DJs, and your team.', defaultOn: true },
  { id: 'analytics',    label: 'Analytics',    path: '/analytics',     category: 'core',     description: 'Streams, audience, top territories.', defaultOn: true },
  { id: 'earnings',     label: 'Earnings',     path: '/earnings',      category: 'core',     description: 'Royalties, splits, payouts.', defaultOn: true },
  { id: 'advances',     label: 'Advances',     path: '/advances',      category: 'core',     description: 'Cash advance against future royalties — no rights handover.', defaultOn: true },
  { id: 'platforms',    label: 'Platforms',    path: '/platforms',     category: 'core',     description: 'Pick which stores carry your music.', defaultOn: true },
  { id: 'smart-links',  label: 'Smart Links',  path: '/links',         category: 'core',     description: 'One link, every DSP. Pre-save before drop, listen-now after.', defaultOn: true },
  { id: 'assets',       label: 'Assets',       path: '/assets',        category: 'core',     description: 'Audio, artwork, video files.', defaultOn: true },

  // AI TOOLS — opt-in for artists who want them
  { id: 'studios',      label: 'Studios',      path: '/studios',       category: 'ai-tools', description: 'All AI gen tools — covers, video, captions, A&R critique, EPKs. Unified gallery.', defaultOn: true },
  { id: 'trending',     label: "What's Trending", path: '/trending',   category: 'ai-tools', description: 'Emerging sub-genres + community signals to pick your next lane.', defaultOn: true },
  { id: 'ai-providers', label: 'Connectors',    path: '/ai-providers',  category: 'ai-tools', description: 'Connect your own API keys for AI models.', defaultOn: true },
  { id: 'pre-release',  label: 'Pre-Release',  path: '/pre-release',   category: 'ai-tools', description: 'TikTok/Reels seeding before drop day.', defaultOn: true },
  { id: 'academy',      label: 'Academy',      path: '/academy',       category: 'ai-tools', description: 'Tutorials and walkthroughs.' },

  // CREATORS — only if you work with influencers/DJs
  { id: 'campaigns',    label: 'Campaigns',    path: '/campaigns',     category: 'creators', description: 'Run paid posts with vetted creators.', defaultOn: true },
  { id: 'influencers',  label: 'Influencers',  path: '/influencers',   category: 'creators', description: 'Browse and book content creators.', defaultOn: true },
  { id: 'dj-packs',     label: 'DJ Packs',     path: '/djs',           category: 'creators', description: 'Send stems and edits to DJs.' },
  { id: 'reactions',    label: 'Reactions',    path: '/reactions',     category: 'creators', description: 'Pitch tracks to reaction channels.' },
  { id: 'social-ads',   label: 'Social Ads',   path: '/social',        category: 'creators', description: 'Spotify/Meta/TikTok ad campaigns.' },

  // BUSINESS — back-office for serious users
  { id: 'admin',        label: 'Admin',        path: '/admin',         category: 'business', description: 'DropKast operator console — oversee every user, submission, campaign, payout.', defaultOn: false },
  { id: 'splits',       label: 'Split Sheets', path: '/splits',        category: 'business', description: 'Co-writer and producer splits.', defaultOn: true },
  { id: 'compliance',   label: 'Compliance',   path: '/compliance',    category: 'business', description: 'GDPR exports, DMCA, audit log.' },
  { id: 'publishing',   label: 'Publishing',   path: '/publishing',    category: 'core',     description: 'Composition rights administration and share management.', defaultOn: true },
  { id: 'video',        label: 'Video',        path: '/video/distribute', category: 'core',  description: 'Video distribution to DSP networks.', defaultOn: true },
  { id: 'marketing',    label: 'Marketing',    path: '/promo',         category: 'ai-tools', description: 'Pre-saves, pitching, promo art generation.', defaultOn: true },
];

export const MODULE_BY_ID: Record<ModuleId, ModuleDef> = MODULES.reduce(
  (acc, m) => ({ ...acc, [m.id]: m }),
  {} as Record<ModuleId, ModuleDef>,
);

export const CATEGORY_LABEL: Record<ModuleCategory, string> = {
  'core':       'Core',
  'ai-tools':   'AI tools',
  'creators':   'Creator economy',
  'business':   'Business',
};

export const CATEGORY_DESCRIPTION: Record<ModuleCategory, string> = {
  'core':     'Always available. The basics — releases, analytics, payouts.',
  'ai-tools': 'AI-assisted content generation. Skip these if you make your own assets.',
  'creators': 'Influencer, DJ, and reaction marketing. Skip if you self-promote.',
  'business': 'Back-office tools — splits, A&R critique, compliance.',
};

/* =========================================================================
 * Presets
 * ========================================================================= */

export type WorkspacePreset = 'minimal' | 'creator' | 'full';

export const PRESETS: Record<WorkspacePreset, { label: string; description: string; modules: ModuleId[] }> = {
  minimal: {
    label: 'Minimal',
    description: 'Distribute, get paid, and make content — without the creator marketplace or back-office extras.',
    modules: [
      // core distribution + money
      'home', 'releases', 'settings',
      'messages', 'analytics', 'earnings', 'platforms', 'assets',
      'splits', 'publishing', 'video',
      // generation/content tools are always included — they're paid features
      'studios', 'marketing', 'ai-providers',
    ],
  },
  creator: {
    label: 'Creator',
    description: 'Distribution + AI assistant + a couple of marketing tools. Recommended default.',
    modules: MODULES.filter((m) => m.defaultOn).map((m) => m.id),
  },
  full: {
    label: 'Full studio',
    description: 'Everything turned on. The whole DropKast suite.',
    modules: MODULES.map((m) => m.id),
  },
};

export const DEFAULT_ENABLED: ModuleId[] = PRESETS.creator.modules;

const STORAGE_KEY = 'dropkast.workspace.modules';

export function loadEnabledModules(): Set<ModuleId> {
  if (typeof window === 'undefined') return new Set(DEFAULT_ENABLED);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set(DEFAULT_ENABLED);
    const ids = JSON.parse(raw) as ModuleId[];
    // Always force required modules on
    const set = new Set<ModuleId>(ids);
    for (const m of MODULES) if (m.required) set.add(m.id);
    return set;
  } catch {
    return new Set(DEFAULT_ENABLED);
  }
}

export function saveEnabledModules(ids: Set<ModuleId>): void {
  if (typeof window === 'undefined') return;
  try {
    // Always include required modules
    const final = new Set(ids);
    for (const m of MODULES) if (m.required) final.add(m.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(final)));
  } catch {
    /* ignore quota errors */
  }
}
