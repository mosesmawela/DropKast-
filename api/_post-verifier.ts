/**
 * Phase 4 — pluggable post verification adapter.
 *
 * When an influencer claims they posted a campaign track on TikTok or
 * Instagram, we verify by:
 *  1. Fetching the post metadata from the platform's API.
 *  2. Confirming the audio used matches the campaign release.
 *  3. (Optional) reading view/like/share counts to size payout.
 *
 * Default = ManualAdapter (records the claim, marks 'pending', a human
 * confirms). When TikTok / Meta API access lands, swap in the real
 * adapters. The interface stays the same.
 */
import { logger } from './_logger.js';

export type VerifierProvider = 'manual' | 'tiktok' | 'meta';

export interface VerificationResult {
  ok: boolean;
  status: 'pending' | 'verified' | 'rejected';
  matchedAudio: boolean;
  metrics?: { views?: number; likes?: number; shares?: number; saves?: number };
  postedAt?: Date;
  reason?: string;
}

export interface PostVerifierAdapter {
  readonly id: VerifierProvider;
  verify(input: {
    postUrl: string;
    expectedIsrc?: string;
    expectedReleaseId?: string;
  }): Promise<VerificationResult>;
}

/* =========================================================================
 * Manual (default — verification is human-driven, queues claim for review)
 * ========================================================================= */
class ManualVerifierAdapter implements PostVerifierAdapter {
  readonly id: VerifierProvider = 'manual';

  async verify(input: { postUrl: string; expectedReleaseId?: string }): Promise<VerificationResult> {
    // Simple URL parse for sanity. We can detect the platform from the URL
    // even without API access, which is useful for routing the manual review.
    const platform = detectPlatform(input.postUrl);
    if (!platform) {
      return {
        ok: false,
        status: 'rejected',
        matchedAudio: false,
        reason: 'Unrecognized URL — must be TikTok, Instagram, YouTube Shorts, or X.',
      };
    }
    logger.info({ postUrl: input.postUrl, platform, releaseId: input.expectedReleaseId }, 'manual verification queued');
    return {
      ok: true,
      status: 'pending',
      matchedAudio: false,  // unknown until human reviews
      reason: `Queued for manual review (${platform}).`,
    };
  }
}

/* =========================================================================
 * TikTok (real — needs Marketing API approval + TIKTOK_ACCESS_TOKEN)
 * ========================================================================= */
class TikTokVerifierAdapter implements PostVerifierAdapter {
  readonly id: VerifierProvider = 'tiktok';
  constructor(private accessToken: string) {}

  async verify(_input: { postUrl: string; expectedIsrc?: string }): Promise<VerificationResult> {
    // Stub. The real call is /v2/research/video/query with the post id
    // extracted from the URL. We need the audio fingerprint or the music_id
    // matched against the campaign's expected ISRC/audio asset.
    logger.warn('TikTok verifier called but adapter is scaffold — falling back to manual');
    return new ManualVerifierAdapter().verify(_input);
  }
}

/* =========================================================================
 * Meta / Instagram Graph (real — needs IG Graph API approval + access token)
 * ========================================================================= */
class MetaVerifierAdapter implements PostVerifierAdapter {
  readonly id: VerifierProvider = 'meta';
  constructor(private accessToken: string) {}

  async verify(_input: { postUrl: string; expectedIsrc?: string }): Promise<VerificationResult> {
    logger.warn('Meta/IG verifier called but adapter is scaffold — falling back to manual');
    return new ManualVerifierAdapter().verify(_input);
  }
}

/* =========================================================================
 * Selection
 * ========================================================================= */
export function detectPlatform(url: string): 'tiktok' | 'instagram' | 'youtube' | 'x' | null {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    if (host.endsWith('tiktok.com')) return 'tiktok';
    if (host.endsWith('instagram.com')) return 'instagram';
    if (host.endsWith('youtube.com') || host === 'youtu.be') return 'youtube';
    if (host.endsWith('x.com') || host.endsWith('twitter.com')) return 'x';
    return null;
  } catch {
    return null;
  }
}

let _verifier: PostVerifierAdapter | null = null;

export function getPostVerifier(platformHint?: string | null): PostVerifierAdapter {
  // Pick based on platform hint if API keys are wired
  if (platformHint === 'tiktok' && process.env.TIKTOK_ACCESS_TOKEN) {
    return new TikTokVerifierAdapter(process.env.TIKTOK_ACCESS_TOKEN);
  }
  if ((platformHint === 'instagram' || platformHint === 'meta') && process.env.META_ACCESS_TOKEN) {
    return new MetaVerifierAdapter(process.env.META_ACCESS_TOKEN);
  }
  if (_verifier) return _verifier;
  _verifier = new ManualVerifierAdapter();
  return _verifier;
}
