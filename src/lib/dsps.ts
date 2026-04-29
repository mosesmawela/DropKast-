/**
 * Master DSP / destination list.
 *
 * Sourced from public "where we deliver" pages of DistroKid, TuneCore,
 * RouteNote, Amuse, CD Baby, and Symphonic Distribution. Deduplicated.
 *
 * `id` is a stable slug used in release.stores / platform selection state.
 * `iconSlug` matches simpleicons.org slugs where available; fall back to
 * a generic globe icon when not.
 */

export type DspCategory =
  | 'streaming-tier1'    // The giants: Spotify, Apple, Amazon, YT Music...
  | 'streaming-regional' // Strong in a specific region
  | 'short-form'         // TikTok, Reels, Shorts — pre-release fuel
  | 'dj-pool'            // Beatport, Beatsource, Traxsource
  | 'fitness-bgm'        // Peloton, Soundtrack Your Brand, Mood
  | 'store-download'     // iTunes Store, Amazon MP3, Beatport download
  | 'lyrics'             // Musixmatch, Genius, LyricFind
  | 'radio'              // SiriusXM, iHeart, Pandora Stations, TuneIn
  | 'fingerprint'        // Shazam, ACRCloud, BMAT, Pex
  | 'video'              // Vevo, XITE, Promo Only
  | 'other';             // Bandcamp-style + emerging

export type DspRegion =
  | 'global'
  | 'us-canada'
  | 'latam'
  | 'europe'
  | 'uk-ireland'
  | 'nordics'
  | 'mena'
  | 'africa'
  | 'india'
  | 'china'
  | 'japan-korea'
  | 'sea'
  | 'oceania'
  | 'cis';

export interface Dsp {
  id: string;
  name: string;
  category: DspCategory;
  regions: DspRegion[];
  /** simpleicons.org slug if known; otherwise omit */
  iconSlug?: string;
  /** True for Tier-1 streaming + the big short-form platforms (auto-on by default) */
  recommended?: boolean;
  /** Free-text fee model. "Included" by default for the standard distro fee. */
  fee?: string;
  /** Optional one-line note shown in tooltips */
  note?: string;
}

export const DSPS: Dsp[] = [
  // =====================================================================
  // TIER 1 STREAMING
  // =====================================================================
  { id: 'spotify',          name: 'Spotify',           category: 'streaming-tier1',    regions: ['global'], iconSlug: 'spotify',          recommended: true },
  { id: 'apple-music',      name: 'Apple Music',       category: 'streaming-tier1',    regions: ['global'], iconSlug: 'applemusic',       recommended: true },
  { id: 'amazon-music',     name: 'Amazon Music',      category: 'streaming-tier1',    regions: ['global'], iconSlug: 'amazonmusic',      recommended: true },
  { id: 'youtube-music',    name: 'YouTube Music',     category: 'streaming-tier1',    regions: ['global'], iconSlug: 'youtubemusic',     recommended: true },
  { id: 'youtube-contentid', name: 'YouTube Content ID', category: 'streaming-tier1', regions: ['global'], iconSlug: 'youtube',          note: 'Eligibility-gated. Earns from user-uploaded videos using your audio.' },
  { id: 'tidal',            name: 'Tidal',             category: 'streaming-tier1',    regions: ['global'], iconSlug: 'tidal',            recommended: true },
  { id: 'deezer',           name: 'Deezer',            category: 'streaming-tier1',    regions: ['global'], iconSlug: 'deezer',           recommended: true },
  { id: 'pandora',          name: 'Pandora',           category: 'streaming-tier1',    regions: ['us-canada'], iconSlug: 'pandora' },
  { id: 'soundcloud',       name: 'SoundCloud',        category: 'streaming-tier1',    regions: ['global'], iconSlug: 'soundcloud' },
  { id: 'audiomack',        name: 'Audiomack',         category: 'streaming-tier1',    regions: ['global'], iconSlug: 'audiomack',        note: 'Strong in hip-hop and Africa.' },

  // =====================================================================
  // SHORT-FORM SOCIAL (pre-release fuel)
  // =====================================================================
  { id: 'tiktok',           name: 'TikTok',            category: 'short-form',         regions: ['global'], iconSlug: 'tiktok',           recommended: true, note: 'Sound goes live in TikTok library. Includes CapCut and Resso.' },
  { id: 'instagram',        name: 'Instagram',         category: 'short-form',         regions: ['global'], iconSlug: 'instagram',        recommended: true, note: 'Reels Audio Library + Stories music.' },
  { id: 'facebook',         name: 'Facebook',          category: 'short-form',         regions: ['global'], iconSlug: 'facebook',         recommended: true, note: 'Meta Audio Library — Reels, Stories, profile songs.' },
  { id: 'snapchat',         name: 'Snapchat Sounds',   category: 'short-form',         regions: ['global'], iconSlug: 'snapchat' },
  { id: 'youtube-shorts',   name: 'YouTube Shorts',    category: 'short-form',         regions: ['global'], iconSlug: 'youtubeshorts',    recommended: true, note: 'Auto-included with YouTube Music.' },
  { id: 'triller',          name: 'Triller',           category: 'short-form',         regions: ['global'] },
  { id: 'likee',            name: 'Likee',             category: 'short-form',         regions: ['sea', 'mena', 'africa'] },
  { id: 'kuaishou',         name: 'Kuaishou',          category: 'short-form',         regions: ['china'] },

  // =====================================================================
  // REGIONAL STREAMING — MENA / AFRICA / INDIA
  // =====================================================================
  { id: 'anghami',          name: 'Anghami',           category: 'streaming-regional', regions: ['mena'],   iconSlug: 'anghami',          note: 'MENA leader.' },
  { id: 'boomplay',         name: 'Boomplay',          category: 'streaming-regional', regions: ['africa'], iconSlug: 'boomplay',         recommended: true, note: 'Africa’s #1 streaming service.' },
  { id: 'mdundo',           name: 'Mdundo',            category: 'streaming-regional', regions: ['africa'] },
  { id: 'spinlet',          name: 'Spinlet',           category: 'streaming-regional', regions: ['africa'] },
  { id: 'jiosaavn',         name: 'JioSaavn',          category: 'streaming-regional', regions: ['india'],  iconSlug: 'jiosaavn',         recommended: true },
  { id: 'gaana',            name: 'Gaana',             category: 'streaming-regional', regions: ['india'],  iconSlug: 'gaana' },
  { id: 'hungama',          name: 'Hungama',           category: 'streaming-regional', regions: ['india'],  iconSlug: 'hungama' },
  { id: 'wynk',             name: 'Wynk Music',        category: 'streaming-regional', regions: ['india'] },
  { id: 'jio-tunes',        name: 'JioTunes',          category: 'streaming-regional', regions: ['india'],  note: 'Caller-tune service.' },

  // =====================================================================
  // REGIONAL STREAMING — CHINA / EAST ASIA
  // =====================================================================
  { id: 'tencent-qq',       name: 'QQ Music',          category: 'streaming-regional', regions: ['china'],  note: 'Tencent Music Entertainment.' },
  { id: 'tencent-kugou',    name: 'Kugou',             category: 'streaming-regional', regions: ['china'],  note: 'Tencent.' },
  { id: 'tencent-kuwo',     name: 'Kuwo',              category: 'streaming-regional', regions: ['china'],  note: 'Tencent.' },
  { id: 'netease',          name: 'NetEase Cloud Music', category: 'streaming-regional', regions: ['china'] },
  { id: 'migu',             name: 'Migu Music',        category: 'streaming-regional', regions: ['china'],  note: 'China Mobile.' },
  { id: 'kkbox',            name: 'KKBox',             category: 'streaming-regional', regions: ['japan-korea', 'sea'] },
  { id: 'line-music',       name: 'LINE Music',        category: 'streaming-regional', regions: ['japan-korea'], iconSlug: 'line' },
  { id: 'awa',              name: 'AWA',               category: 'streaming-regional', regions: ['japan-korea'] },
  { id: 'recochoku',        name: 'Recochoku',         category: 'streaming-regional', regions: ['japan-korea'] },
  { id: 'mora',             name: 'mora',              category: 'streaming-regional', regions: ['japan-korea'] },
  { id: 'joox',             name: 'JOOX',              category: 'streaming-regional', regions: ['sea'] },
  { id: 'bugs',             name: 'Bugs!',             category: 'streaming-regional', regions: ['japan-korea'] },
  { id: 'genie',            name: 'Genie Music',       category: 'streaming-regional', regions: ['japan-korea'] },
  { id: 'flo',              name: 'FLO',               category: 'streaming-regional', regions: ['japan-korea'] },
  { id: 'melon',            name: 'Melon',             category: 'streaming-regional', regions: ['japan-korea'] },
  { id: 'resso',            name: 'Resso',             category: 'streaming-regional', regions: ['sea', 'india'], note: 'ByteDance.' },

  // =====================================================================
  // REGIONAL STREAMING — EUROPE / NORDICS / CIS
  // =====================================================================
  { id: 'qobuz',            name: 'Qobuz',             category: 'streaming-regional', regions: ['europe', 'us-canada'], iconSlug: 'qobuz', note: 'Hi-res audiophile.' },
  { id: '7digital',         name: '7digital',          category: 'streaming-regional', regions: ['uk-ireland', 'europe'] },
  { id: 'yandex-music',     name: 'Yandex Music',      category: 'streaming-regional', regions: ['cis'],    iconSlug: 'yandex' },
  { id: 'zvuk',             name: 'Zvuk',              category: 'streaming-regional', regions: ['cis'] },
  { id: 'vk-music',         name: 'VK Music',          category: 'streaming-regional', regions: ['cis'] },
  { id: 'yousee',           name: 'YouSee Musik',      category: 'streaming-regional', regions: ['nordics'] },
  { id: 'telia',            name: 'Telia Music',       category: 'streaming-regional', regions: ['nordics'] },
  { id: 'nuuday',           name: 'Nuuday / TDC Play', category: 'streaming-regional', regions: ['nordics'] },
  { id: 'netd',             name: 'NetD',              category: 'streaming-regional', regions: ['mena'],   note: 'Turkey.' },
  { id: 'fizy',             name: 'Fizy',              category: 'streaming-regional', regions: ['mena'],   note: 'Turkcell, Turkey.' },

  // =====================================================================
  // REGIONAL STREAMING — LATAM
  // =====================================================================
  { id: 'claro-musica',     name: 'Claro Música',          category: 'streaming-regional', regions: ['latam'] },
  { id: 'tim-music',        name: 'TIM Music',         category: 'streaming-regional', regions: ['latam'],  note: 'Brazil.' },
  { id: 'trebel',           name: 'Trebel',            category: 'streaming-regional', regions: ['latam'],  note: 'Offline-first.' },
  { id: 'imusica',          name: 'iMúsica',             category: 'streaming-regional', regions: ['latam'] },
  { id: 'sonora',           name: 'Sonora',            category: 'streaming-regional', regions: ['latam'] },

  // =====================================================================
  // DJ POOLS / DISCOVERY
  // =====================================================================
  { id: 'beatport',         name: 'Beatport',          category: 'dj-pool',            regions: ['global'], iconSlug: 'beatport', note: 'Electronic-only. Eligibility checked at submission.' },
  { id: 'beatsource',       name: 'Beatsource',        category: 'dj-pool',            regions: ['global'], note: 'Open-format DJ pool.' },
  { id: 'traxsource',       name: 'Traxsource',        category: 'dj-pool',            regions: ['global'], note: 'House and soulful.' },
  { id: 'juno-download',    name: 'Juno Download',     category: 'dj-pool',            regions: ['global'] },
  { id: 'djcity',           name: 'DJCity',            category: 'dj-pool',            regions: ['global'], note: 'Curated pool. Label deals.' },
  { id: 'volumo',           name: 'Volumo',            category: 'dj-pool',            regions: ['global'], note: 'Formerly DJ TuneXchange.' },
  { id: 'bpm-supreme',      name: 'BPM Supreme',       category: 'dj-pool',            regions: ['global'] },
  { id: 'disco',            name: 'DISCO',             category: 'dj-pool',            regions: ['global'], note: 'Sync and A&R search.' },

  // =====================================================================
  // FITNESS / B2B SYNC / BACKGROUND MUSIC
  // =====================================================================
  { id: 'peloton',          name: 'Peloton',           category: 'fitness-bgm',        regions: ['global'], note: 'Catalogue licensing only.' },
  { id: 'soundtrack-yb',    name: 'Soundtrack Your Brand', category: 'fitness-bgm',    regions: ['global'], note: 'Spotify B2B (separate licensing).' },
  { id: 'mood-media',       name: 'Mood Media',        category: 'fitness-bgm',        regions: ['global'] },
  { id: 'rockbot',          name: 'Rockbot',           category: 'fitness-bgm',        regions: ['us-canada'] },
  { id: 'cloud-cover',      name: 'Cloud Cover Music', category: 'fitness-bgm',        regions: ['us-canada'] },
  { id: 'touchtunes',       name: 'TouchTunes',        category: 'fitness-bgm',        regions: ['us-canada'], note: 'Bar / restaurant jukebox.' },
  { id: 'ami-jukebox',      name: 'AMI Entertainment', category: 'fitness-bgm',        regions: ['us-canada'] },
  { id: 'feed-fm',          name: 'Feed.fm',           category: 'fitness-bgm',        regions: ['global'] },
  { id: 'soundmachine',     name: 'Soundmachine',      category: 'fitness-bgm',        regions: ['global'] },
  { id: 'custom-channels',  name: 'Custom Channels',   category: 'fitness-bgm',        regions: ['global'] },
  { id: 'equinox',          name: 'Equinox / SoulCycle', category: 'fitness-bgm',      regions: ['us-canada'], note: 'Sync deals only.' },

  // =====================================================================
  // STORES / DOWNLOADS
  // =====================================================================
  { id: 'itunes-store',     name: 'iTunes Store',      category: 'store-download',     regions: ['global'], iconSlug: 'itunes',           recommended: true },
  { id: 'amazon-mp3',       name: 'Amazon MP3',        category: 'store-download',     regions: ['global'] },
  { id: 'beatport-store',   name: 'Beatport Store',    category: 'store-download',     regions: ['global'] },
  { id: 'qobuz-store',      name: 'Qobuz Store',       category: 'store-download',     regions: ['europe', 'us-canada'] },
  { id: 'hdtracks',         name: 'HDtracks',          category: 'store-download',     regions: ['us-canada'], note: 'Hi-res, selective.' },

  // =====================================================================
  // LYRICS
  // =====================================================================
  { id: 'musixmatch',       name: 'Musixmatch',        category: 'lyrics',             regions: ['global'], iconSlug: 'musixmatch',       recommended: true, note: 'Powers Spotify and TikTok lyrics.' },
  { id: 'genius',           name: 'Genius',            category: 'lyrics',             regions: ['global'], iconSlug: 'genius' },
  { id: 'lyricfind',        name: 'LyricFind',         category: 'lyrics',             regions: ['global'] },

  // =====================================================================
  // RADIO / BROADCAST
  // =====================================================================
  { id: 'siriusxm',         name: 'SiriusXM',          category: 'radio',              regions: ['us-canada'], iconSlug: 'siriusxm' },
  { id: 'iheart',           name: 'iHeartRadio',       category: 'radio',              regions: ['us-canada'], iconSlug: 'iheartradio' },
  { id: 'pandora-stations', name: 'Pandora Stations',  category: 'radio',              regions: ['us-canada'] },
  { id: 'tunein',           name: 'TuneIn Radio',      category: 'radio',              regions: ['global'],   iconSlug: 'tunein' },
  { id: 'accuradio',        name: 'AccuRadio',         category: 'radio',              regions: ['us-canada'] },
  { id: 'dash-radio',       name: 'Dash Radio',        category: 'radio',              regions: ['us-canada'] },

  // =====================================================================
  // FINGERPRINTING / RECOGNITION (auto-protect)
  // =====================================================================
  { id: 'shazam',           name: 'Shazam',            category: 'fingerprint',        regions: ['global'], iconSlug: 'shazam',           note: 'Auto-included with Apple Music.' },
  { id: 'acrcloud',         name: 'ACRCloud',          category: 'fingerprint',        regions: ['global'] },
  { id: 'bmat',             name: 'BMAT',              category: 'fingerprint',        regions: ['global'] },
  { id: 'pex',              name: 'Pex',               category: 'fingerprint',        regions: ['global'] },
  { id: 'audible-magic',    name: 'Audible Magic',     category: 'fingerprint',        regions: ['global'] },

  // =====================================================================
  // VIDEO PLATFORMS
  // =====================================================================
  { id: 'vevo',             name: 'Vevo',              category: 'video',              regions: ['global'], iconSlug: 'vevo',             note: 'Music video distribution.' },
  { id: 'xite',             name: 'XITE',              category: 'video',              regions: ['global'] },
  { id: 'promo-only',       name: 'Promo Only',        category: 'video',              regions: ['global'], note: 'DJ video pool.' },

  // =====================================================================
  // OTHER / EMERGING
  // =====================================================================
  { id: 'twitch-soundtrack', name: 'Twitch Soundtrack', category: 'other',             regions: ['global'], iconSlug: 'twitch',           note: 'Stream-safe music for creators.' },
  { id: 'mixcloud',         name: 'Mixcloud',          category: 'other',              regions: ['global'], iconSlug: 'mixcloud',         note: 'Labels only.' },
  { id: 'spinrilla',        name: 'Spinrilla',         category: 'other',              regions: ['us-canada'], note: 'US hip-hop mixtape platform.' },
  { id: 'd-music',          name: 'd’Music',             category: 'other',              regions: ['sea'],    note: 'Singapore / StarHub.' },
  { id: 'utopia-music',     name: 'Utopia Music',      category: 'other',              regions: ['global'] },
  { id: 'tuned-global',     name: 'Tuned Global',      category: 'other',              regions: ['global'],  note: 'Telco white-label.' },
  { id: 'roxi',             name: 'Roxi',              category: 'other',              regions: ['uk-ireland'], note: 'Karaoke / lean-back.' },
  { id: 'soundcloud-next-pro', name: 'SoundCloud Next Pro', category: 'other',         regions: ['global'] },
];

/* =========================================================================
 * Convenience accessors
 * ========================================================================= */

export const CATEGORY_LABEL: Record<DspCategory, string> = {
  'streaming-tier1':    'Major streaming',
  'streaming-regional': 'Regional streaming',
  'short-form':         'Short-form / social',
  'dj-pool':            'DJ pools',
  'fitness-bgm':        'Fitness & B2B',
  'store-download':     'Stores & downloads',
  'lyrics':             'Lyrics',
  'radio':              'Radio',
  'fingerprint':        'Fingerprinting',
  'video':              'Music video',
  'other':              'Other',
};

export const REGION_LABEL: Record<DspRegion, string> = {
  'global':       'Global',
  'us-canada':    'US & Canada',
  'latam':        'Latin America',
  'europe':       'Europe',
  'uk-ireland':   'UK & Ireland',
  'nordics':      'Nordics',
  'mena':         'MENA',
  'africa':       'Africa',
  'india':        'India',
  'china':        'China',
  'japan-korea':  'Japan & Korea',
  'sea':          'Southeast Asia',
  'oceania':      'Oceania',
  'cis':          'CIS / Russia',
};

export const ALL_DSP_IDS = DSPS.map((d) => d.id);
export const RECOMMENDED_DSP_IDS = DSPS.filter((d) => d.recommended).map((d) => d.id);
export const TIER1_DSP_IDS = DSPS.filter((d) => d.category === 'streaming-tier1').map((d) => d.id);
export const SHORT_FORM_DSP_IDS = DSPS.filter((d) => d.category === 'short-form').map((d) => d.id);

export function dspsByCategory(category: DspCategory): Dsp[] {
  return DSPS.filter((d) => d.category === category);
}

export function dspsByRegion(region: DspRegion): Dsp[] {
  return DSPS.filter((d) => d.regions.includes(region));
}

export function findDsp(id: string): Dsp | undefined {
  return DSPS.find((d) => d.id === id);
}
