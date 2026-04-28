import { z } from 'zod';

export const releaseCreateSchema = z.object({
  title: z.string().min(1).optional(),
  project_name: z.string().optional(),
  artist: z.string().optional(),
  artist_name: z.string().optional(),
  genre: z.string().optional(),
  platforms: z.union([z.array(z.any()), z.string()]).optional(),
}).passthrough();

export const releasePatchSchema = z.object({}).passthrough();

export const campaignCreateSchema = z.object({
  releaseId: z.string().optional(),
  goal: z.string().optional(),
  budget: z.number().optional(),
});

export const influencerCreateSchema = z.object({
  name: z.string().min(1),
  platform: z.string().min(1),
  reach: z.string().optional(),
  genre: z.string().optional(),
  avatar: z.string().url().optional(),
}).passthrough();

export const influencerSendSchema = z.object({
  campaignId: z.string(),
  influencerIds: z.array(z.string()),
});

export const splitCreateSchema = z.object({
  releaseId: z.string(),
  payeeEmail: z.string().email(),
  payeeName: z.string().optional(),
  percentage: z.number().min(0).max(100),
}).passthrough();

export const anrSubmitSchema = z.object({
  trackTitle: z.string().min(1),
  releaseId: z.string().optional(),
  notes: z.string().optional(),
  lyrics: z.string().optional(),
  bio: z.string().optional(),
}).passthrough();

export const promoGenerateSchema = z.object({
  releaseId: z.string().optional(),
  type: z.string().optional(),
});

export const ugcGenerateSchema = z.object({
  type: z.string().optional(),
  releaseId: z.string().optional(),
});

export const automationSchema = z.object({
  releaseId: z.string(),
  autoUGC: z.boolean().optional(),
  autoInfluencers: z.boolean().optional(),
  autoAds: z.boolean().optional(),
});

export const analyticsTrackSchema = z.object({
  userId: z.string().optional(),
  releaseId: z.string().optional(),
  type: z.string(),
  platform: z.string().optional(),
  value: z.number().optional(),
});

export const aiChatSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
  userId: z.string().optional(),
});

export const preReleaseCreateSchema = z.object({
  title: z.string().optional(),
  hookStart: z.number().optional(),
  hookEnd: z.number().optional(),
  creators: z.array(z.unknown()).optional(),
  status: z.string().optional(),
});

/**
 * Wraps a request handler with Zod body validation. On parse failure responds 400.
 */
export function validate<T extends z.ZodTypeAny>(schema: T) {
  return (req: any, res: any, next: any) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        issues: parsed.error.issues,
      });
    }
    req.body = parsed.data;
    next();
  };
}
