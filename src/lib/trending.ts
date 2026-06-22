/**
 * What's Trending — surfaces emerging sub-genres + community signals.
 *
 * Real impl will pull from Spotify trending charts + TikTok sound discovery +
 * our own internal release tagging. For now: curated seed data + an
 * AI-refresh endpoint that asks Claude to surface new sub-genres each week.
 */

export type TrendMomentum = 'spiking' | 'rising' | 'steady' | 'cooling';

export interface SubGenre {
  id: string;
  name: string;
  parentGenre: string;
  description: string;
  /** 2-4 word vibe tag */
  vibe: string[];
  /** Example artists / tracks moving in this lane */
  exampleArtists: string[];
  /** "Pulse" — 0-100, how loud the signal is right now */
  pulse: number;
  momentum: TrendMomentum;
  /** Where the heat is coming from */
  origin: string;
  /** Top platforms surfacing it */
  platforms: Array<'tiktok' | 'spotify' | 'instagram' | 'youtube' | 'soundcloud' | 'audiomack'>;
  /** Hashtags */
  tags: string[];
  /** Color used for the card accent (CSS color) */
  accent: string;
  /** When this was added to the trending feed */
  addedAt: string;
  /** Optional artist creator credit if this sub-genre is being driven by a specific community */
  creatorCredit?: string;
}

/**
 * Hand-curated seed feed — these are real-or-real-adjacent micro-genres
 * actually emerging in 2026. The AI-refresh endpoint extends + ranks
 * these dynamically.
 */
export const SEED_TRENDS: SubGenre[] = [
  {
    id: 'amapiano-cinema',
    name: 'Amapiano Cinema',
    parentGenre: 'Amapiano',
    description:
      'Slow-burn amapiano with film-score textures. Built around emotional builds, choir samples, and 92-95 BPM. Designed to soundtrack moments, not the dance floor.',
    vibe: ['cinematic', 'emotional', 'choir-led'],
    exampleArtists: ['Buddy Kay', 'Kelvin Momo', 'Aymos'],
    pulse: 87,
    momentum: 'spiking',
    origin: 'Johannesburg ↔ Cape Town label scene',
    platforms: ['tiktok', 'spotify', 'youtube'],
    tags: ['#amacinema', '#amapianofilm', '#slowamapiano'],
    accent: '#FF8E3C',
    addedAt: '2026-06-14',
    creatorCredit: 'LVRN Africa division',
  },
  {
    id: 'hyperblues',
    name: 'Hyperblues',
    parentGenre: 'Hyperpop',
    description:
      'Hyperpop meets blues phrasing. Pitched-up vocal stacks over 12-bar progressions, 808 thump where the slide guitar used to sit. The pain hits 2x faster.',
    vibe: ['nostalgic', 'glitchy', 'heartbreak'],
    exampleArtists: ['Aqua Pearl', 'glaive', 'midwxst'],
    pulse: 72,
    momentum: 'rising',
    origin: 'SoundCloud → TikTok crossover',
    platforms: ['tiktok', 'soundcloud', 'spotify'],
    tags: ['#hyperblues', '#sadhyperpop', '#bluespop'],
    accent: '#7C3AED',
    addedAt: '2026-06-08',
  },
  {
    id: 'sundown-rnb',
    name: 'Sundown R&B',
    parentGenre: 'R&B',
    description:
      'Sunset-hour R&B. Slowed-down 6/8 grooves, single-take vocal feels, room mics on the snare. Anti-trap-snare movement. 65-72 BPM sweet spot.',
    vibe: ['intimate', 'analog', 'unhurried'],
    exampleArtists: ['Night Pulse', 'Snoh Aalegra', "Daniel Caesar"],
    pulse: 64,
    momentum: 'rising',
    origin: 'London ↔ Toronto producers',
    platforms: ['spotify', 'instagram', 'audiomack'],
    tags: ['#sundownrnb', '#analogrnb', '#slowrnb'],
    accent: '#F472B6',
    addedAt: '2026-06-02',
  },
  {
    id: 'afrocore',
    name: 'Afrocore',
    parentGenre: 'Afrobeats',
    description:
      'Heavy guitars meet log drums. Afrobeats melodic instincts with metalcore aggression — breakdowns, double-kick, screamed pre-choruses. New, weird, working.',
    vibe: ['heavy', 'percussive', 'aggressive'],
    exampleArtists: ['CIZA', 'Tems-adjacent producers', 'experimental Lagos scene'],
    pulse: 58,
    momentum: 'spiking',
    origin: 'Lagos underground',
    platforms: ['tiktok', 'youtube', 'spotify'],
    tags: ['#afrocore', '#heavyafro', '#metalafro'],
    accent: '#DC2626',
    addedAt: '2026-05-28',
    creatorCredit: 'LVRN A&R desk',
  },
  {
    id: 'lofi-drill',
    name: 'Lo-fi Drill',
    parentGenre: 'Drill',
    description:
      'UK drill production at half-tempo with bedroom-lo-fi mixing. Tape hiss over 808 slides. Made for studying, not stunting.',
    vibe: ['mellow', 'introspective', 'tape-warm'],
    exampleArtists: ['Lyric Storm', 'Central Cee in slow-mode', 'Mostack'],
    pulse: 51,
    momentum: 'rising',
    origin: 'YouTube lo-fi channels',
    platforms: ['youtube', 'spotify', 'tiktok'],
    tags: ['#lofidrill', '#studydrill', '#slowdrill'],
    accent: '#0EA5E9',
    addedAt: '2026-05-21',
  },
  {
    id: 'hyperhouse',
    name: 'Hyperhouse',
    parentGenre: 'House',
    description:
      'Classic house piano stabs, 128 BPM, but with hyperpop-pitched vocal hooks layered on top. The Skrillex × Fred Again moment, productized.',
    vibe: ['euphoric', 'maximal', 'club-ready'],
    exampleArtists: ['Solomon Cyan', 'Fred again..', 'Romy'],
    pulse: 79,
    momentum: 'spiking',
    origin: 'Berlin → LA',
    platforms: ['spotify', 'soundcloud', 'tiktok'],
    tags: ['#hyperhouse', '#emohouse', '#cryclub'],
    accent: '#22D3EE',
    addedAt: '2026-06-11',
  },
  {
    id: 'spaza-2',
    name: 'Spaza 2.0',
    parentGenre: 'Spaza Rap',
    description:
      'South African vernacular rap with electronic flourishes. The Pdot O / Driemanskap lineage updated — modern 808s, glitchy hi-hats, isiZulu/seSotho/Afrikaans codeswitching.',
    vibe: ['urgent', 'lyrical', 'rooted'],
    exampleArtists: ['Al Xapo', 'Big Zulu', 'rising Joburg crews'],
    pulse: 68,
    momentum: 'rising',
    origin: 'Soweto ↔ Pretoria',
    platforms: ['tiktok', 'youtube', 'audiomack'],
    tags: ['#spaza2', '#zarap', '#newspaza'],
    accent: '#84CC16',
    addedAt: '2026-05-30',
    creatorCredit: 'LVRN Africa division',
  },
  {
    id: 'glitch-folk',
    name: 'Glitch Folk',
    parentGenre: 'Folk',
    description:
      'Acoustic guitar foundations chopped through Ableton glitch racks. Stuttered vocals, time-stretched harmonies, organic warmth bumping into digital edges. Bon Iver if he discovered max/msp.',
    vibe: ['acoustic', 'fragmented', 'meditative'],
    exampleArtists: ['emerging Brooklyn producers', 'Phoebe Bridgers-adjacent', 'Big Thief experiments'],
    pulse: 43,
    momentum: 'steady',
    origin: 'Brooklyn ↔ Berlin studios',
    platforms: ['spotify', 'instagram'],
    tags: ['#glitchfolk', '#deconstructedfolk', '#newfolk'],
    accent: '#A78BFA',
    addedAt: '2026-05-18',
  },
];

export function momentumColor(m: TrendMomentum): string {
  if (m === 'spiking') return '#F87171';
  if (m === 'rising') return '#FBBF24';
  if (m === 'steady') return '#A3A3A3';
  return '#6366F1'; // cooling
}

export function momentumLabel(m: TrendMomentum): string {
  if (m === 'spiking') return '🔥 SPIKING';
  if (m === 'rising') return '↗ RISING';
  if (m === 'steady') return '— STEADY';
  return '↘ COOLING';
}
