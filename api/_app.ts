import express from "express";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { generateStrategy, generateViralIdeas, generateImage, generateVideo, critiqueSubmission } from "../src/services/aiService.js";
import { store } from "./_store.js";
import {
  releaseCreateSchema,
  releasePatchSchema,
  campaignCreateSchema,
  influencerCreateSchema,
  influencerSendSchema,
  splitCreateSchema,
  anrSubmitSchema,
  promoGenerateSchema,
  ugcGenerateSchema,
  automationSchema,
  analyticsTrackSchema,
  preReleaseCreateSchema,
  aiChatSchema,
  validate,
} from "./_schemas.js";
import { handleAiChat } from "./_ai-chat.js";
import { listAvailableTextProviders } from "./_text-providers.js";
import { generateIsrc, generateUpc, isPlaceholderRegistrant } from "./_codes.js";
import { validateAudio, validateCoverArt } from "./_audio-validate.js";
import { assertTransition, isScheduledForLater, ReleaseTransitionError, type ReleaseStatus } from "./_release-lifecycle.js";
import { pushEvent, listEventsFor, markRead as markInboxRead } from "./_inbox.js";
import { listThreadsForViewer, listMessagesInThread, postMessage, markThreadRead, findThread, type Role as MsgRole } from "./_messages.js";
import { rateLimit as customRateLimit, securityHeaders, listAuditEvents, logAudit } from "./_security.js";
import { handleDataExport, handleDataDelete, handleDmcaNotice } from "./_compliance.js";
import { logger, httpLog } from "./_logger.js";
import { getDb } from "../db/client.js";
import { getDeliveryAdapter } from "./_dsp-delivery.js";
import { getPayoutAdapter } from "./_payouts.js";
import { parseRoyaltyCsv, appendToLedger, getLedger, aggregateEarnings, applySplits } from "./_royalties.js";
import { matchInfluencers } from "./_match.js";
import { getPostVerifier, detectPlatform } from "./_post-verifier.js";
import { signPackUrl, verifyPackUrl } from "./_signed-url.js";
import {
  getSubscription as getSubRecord,
  createCheckoutSession,
  createPortalSession,
  applyStripeSubscriptionEvent,
} from "./_billing.js";

let uploadMiddleware: any = null;

function getUploadMiddleware() {
  if (uploadMiddleware) return uploadMiddleware;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    const storage = new CloudinaryStorage({
      cloudinary: cloudinary as any,
      params: { folder: "newdistro", resource_type: "auto" } as any,
    });
    uploadMiddleware = multer({ storage });
  } else {
    console.warn("Cloudinary keys missing. Falling back to memory storage.");
    uploadMiddleware = multer({ storage: multer.memoryStorage() });
  }
  return uploadMiddleware;
}

export function createApiApp() {
  const app = express();

  // Security: Set security-related HTTP headers
  app.use(helmet());

  // Security: Enable CORS with default settings (can be further restricted)
  app.use(cors());

  // Security: Rate limiting to prevent abuse
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: 'draft-8', // Return rate limit info in the RateLimit headers
    legacyHeaders: false, // Disable the X-RateLimit headers
    message: { error: 'Too many requests, please try again later.' },
  });
  app.use('/api/', limiter);

  app.use(express.json({ limit: '4mb' }));

  // ---- Phase 6 + 7: structured logging + security headers (early in chain) ----
  app.use(httpLog);
  app.use(securityHeaders);

  const upload = getUploadMiddleware();

  // ---- Real health check (Phase 6) ----
  // Pings the configured services rather than just checking env vars.
  // Returns 503 if any "expected" service is unreachable.
  app.get("/api/health", async (_req, res) => {
    const checks: Record<string, { ok: boolean; latencyMs?: number; note?: string }> = {};
    const t0 = Date.now();

    // DB: only ping if DATABASE_URL is set
    if (process.env.DATABASE_URL) {
      try {
        const db = getDb();
        if (db) {
          const start = Date.now();
          // Drizzle/postgres-js: any cheap query suffices
          await (db as any).execute?.('select 1') ?? Promise.resolve();
          checks.database = { ok: true, latencyMs: Date.now() - start };
        } else {
          checks.database = { ok: false, note: 'getDb() returned null' };
        }
      } catch (err) {
        checks.database = { ok: false, note: String(err).slice(0, 120) };
      }
    } else {
      checks.database = { ok: true, note: 'in-memory fallback (no DATABASE_URL)' };
    }

    // LLM: ping the lowest-latency configured provider
    const llmKey =
      (process.env.GROQ_API_KEY && { name: 'groq', url: 'https://api.groq.com/openai/v1/models', auth: process.env.GROQ_API_KEY }) ||
      (process.env.NVIDIA_API_KEY && { name: 'nvidia', url: 'https://integrate.api.nvidia.com/v1/models', auth: process.env.NVIDIA_API_KEY }) ||
      (process.env.ANTHROPIC_API_KEY && { name: 'anthropic', url: 'https://api.anthropic.com/v1/models', auth: process.env.ANTHROPIC_API_KEY, headerName: 'x-api-key' }) ||
      null;
    if (llmKey) {
      try {
        const start = Date.now();
        const headers: Record<string, string> = {};
        if ((llmKey as any).headerName === 'x-api-key') {
          headers['x-api-key'] = (llmKey as any).auth;
          headers['anthropic-version'] = '2023-06-01';
        } else {
          headers['Authorization'] = `Bearer ${(llmKey as any).auth}`;
        }
        const r = await fetch((llmKey as any).url, {
          headers,
          signal: AbortSignal.timeout(3000),
        });
        checks.llm = { ok: r.ok, latencyMs: Date.now() - start, note: `${(llmKey as any).name} · HTTP ${r.status}` };
      } catch (err) {
        checks.llm = { ok: false, note: `${(llmKey as any).name} · ${String(err).slice(0, 100)}` };
      }
    } else {
      checks.llm = { ok: false, note: 'no LLM provider configured' };
    }

    const allOk = Object.values(checks).every((c) => c.ok);
    res.status(allOk ? 200 : 503).json({
      ok: allOk,
      time: new Date().toISOString(),
      uptimeMs: Date.now() - t0,
      checks,
      services: {
        anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
        nvidia: Boolean(process.env.NVIDIA_API_KEY),
        groq: Boolean(process.env.GROQ_API_KEY),
        cerebras: Boolean(process.env.CEREBRAS_API_KEY),
        openrouter: Boolean(process.env.OPENROUTER_API_KEY),
        moonshot: Boolean(process.env.MOONSHOT_API_KEY),
        openai: Boolean(process.env.OPENAI_API_KEY),
        google: Boolean(process.env.GOOGLE_API_KEY),
        cloudinary: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
        database: Boolean(process.env.DATABASE_URL),
        supabase: Boolean(process.env.VITE_SUPABASE_URL),
      },
    });
  });

  // ---- Phase 7: rate limits on hot endpoints ----
  // 30 req / 5 min per IP for AI chat (heavy)
  app.use('/api/ai/chat', customRateLimit({ name: 'ai-chat', max: 30, windowMs: 5 * 60 * 1000 }));
  // 10 / hour per IP for A&R critique (very heavy)
  app.use('/api/anr', customRateLimit({ name: 'anr', max: 10, windowMs: 60 * 60 * 1000 }));
  // 5 / hour for DMCA filings to deter spam takedowns
  app.use('/api/dmca', customRateLimit({ name: 'dmca', max: 5, windowMs: 60 * 60 * 1000 }));

  // --- AI Chat (streaming SSE with tool use) ---
  app.post("/api/ai/chat", validate(aiChatSchema), handleAiChat);

  // --- AI providers — which keys are configured ---
  app.get("/api/ai/providers", (_req, res) => {
    res.json({ providers: listAvailableTextProviders() });
  });

  // --- A&R critique (Claude-powered) ---
  app.post("/api/anr", validate(anrSubmitSchema), async (req, res) => {
    const id = `ANR-${Date.now()}`;
    const submission = {
      id,
      trackTitle: req.body.trackTitle,
      releaseId: req.body.releaseId,
      notes: req.body.notes,
      status: 'pending',
      critique: null,
      createdAt: new Date(),
    };
    await store.insertAnrSubmission(submission);

    // Kick off critique asynchronously
    (async () => {
      try {
        const critique = await critiqueSubmission({
          trackTitle: req.body.trackTitle,
          notes: req.body.notes,
          lyrics: req.body.lyrics,
          bio: req.body.bio,
        });
        await store.patchAnrSubmission(id, { status: 'reviewed', critique });
      } catch (err) {
        console.error('[A&R] critique failed:', err);
        await store.patchAnrSubmission(id, { status: 'error' });
      }
    })();

    res.json({ success: true, submission });
  });

  app.get("/api/anr", async (_req, res) => {
    const subs = await store.listAnrSubmissions();
    res.json(subs);
  });

  app.get("/api/anr/:id", async (req, res) => {
    const sub = await store.getAnrSubmission(req.params.id);
    if (!sub) return res.status(404).json({ error: 'not found' });
    res.json(sub);
  });

  // --- Pre-Release APIs ---
  app.get("/api/pre-releases", async (_req, res) => {
    res.json(await store.listPreReleases());
  });

  app.post("/api/pre-releases", validate(preReleaseCreateSchema), async (req, res) => {
    const activation = {
      id: `PRE-${Date.now()}`,
      userId: 'user-1',
      title: req.body.title,
      hookStart: req.body.hookStart,
      hookEnd: req.body.hookEnd,
      creators: req.body.creators || [],
      status: req.body.status || 'draft',
      releaseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date(),
    };
    await store.insertPreRelease(activation);
    res.json(activation);
  });

  app.post("/api/pre-release/:id/tiktok", async (_req, res) => {
    const ideas = [
      { type: "POV", idea: "POV: you hear this at a party", title: "The Party Paradox", caption: "WAIT FOR THE DROP 👀 #newmusic #viral" },
      { type: "Dance", idea: "Simple 3-step transition challenge", title: "Sync Sequence", caption: "Try this sequence with your squad ⚡ #DropKast #challenge" },
      { type: "Trend", idea: "High-contrast glitch transition trend", title: "Glitch Shift", caption: "Entering the next dimension. 🌐 #Transition #Edit" },
    ];
    res.json({ ideas });
  });

  app.post("/api/pre-release/:id/invasion", async (req, res) => {
    const { id } = req.params;
    const activation = await store.getPreRelease(id);
    if (activation) await store.patchPreRelease(id, { status: 'invading' });
    console.log(`[INVASION_MODE] Coordinated signal broadcast initiated for ${id}.`);
    res.json({ status: "success", strategy: "coordinated_burst" });
  });

  // --- Analytics APIs ---
  app.post("/api/analytics/track", validate(analyticsTrackSchema), async (req, res) => {
    const event = {
      id: `EVT-${Date.now()}`,
      userId: req.body.userId || 'anonymous',
      releaseId: req.body.releaseId,
      type: req.body.type,
      platform: req.body.platform,
      value: req.body.value || 1,
      timestamp: new Date(),
    };
    await store.insertAnalyticsEvent(event);
    res.json({ ok: true, event });
  });

  app.get("/api/analytics/:releaseId", async (req, res) => {
    const events = await store.listAnalyticsEvents(req.params.releaseId);
    res.json({
      plays: events.filter((e: any) => e.type === 'play').length,
      clicks: events.filter((e: any) => e.type === 'click').length,
      influencerPosts: events.filter((e: any) => e.type === 'influencer_post').length,
      totalReach: events.reduce((acc: number, e: any) => acc + (e.value || 0), 0),
    });
  });

  // Delivery is handled by the pluggable DSP adapter (see api/_dsp-delivery.ts).
  // Default is the simulator; flips to RouteNote when ROUTENOTE_API_KEY is set.
  const dspAdapter = getDeliveryAdapter();
  // Payouts are pluggable (see api/_payouts.ts). Stripe when configured, simulator otherwise.
  const payoutAdapter = getPayoutAdapter();

  // In-memory stores for the new Phase 3/4 entities until Drizzle DB is live.
  const memCreatorAccounts: Record<string, any> = {};
  const memPayouts: Record<string, any> = {};
  const memDjFeedback: any[] = [];
  const memVerifiedPosts: any[] = [];

  app.post("/api/releases", upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "artwork", maxCount: 1 },
  ]), async (req: any, res) => {
    const { platforms, releaseDate, ...metadata } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const audioFile = files?.['audio']?.[0];
    const artworkFile = files?.['artwork']?.[0];

    // ---- Phase 1: validate audio + cover before accepting the release.
    const errors: string[] = [];
    const warnings: string[] = [];
    let audioMeta: any = undefined;

    if (audioFile?.buffer) {
      const v = await validateAudio({ buffer: audioFile.buffer, mimeType: audioFile.mimetype });
      errors.push(...v.errors);
      warnings.push(...v.warnings);
      audioMeta = v.meta;
    } else if (audioFile?.path && !audioFile.path.startsWith('http')) {
      const v = await validateAudio({ path: audioFile.path, mimeType: audioFile.mimetype });
      errors.push(...v.errors);
      warnings.push(...v.warnings);
      audioMeta = v.meta;
    }

    if (artworkFile?.buffer) {
      const v = await validateCoverArt({ buffer: artworkFile.buffer, mimeType: artworkFile.mimetype });
      errors.push(...v.errors);
      warnings.push(...v.warnings);
    }

    if (errors.length > 0) {
      return res.status(422).json({
        error: 'Release validation failed',
        errors,
        warnings,
      });
    }

    const audioUrl = audioFile?.path || "https://example.com/mock-audio.wav";
    const artworkUrl = artworkFile?.path || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=3270";

    // ---- Phase 1: ISRC + UPC at create time.
    const isrc = generateIsrc();
    const upc = generateUpc();
    if (isPlaceholderRegistrant()) {
      warnings.push('ISRC/UPC use placeholder registrant codes. Configure ISRC_REGISTRANT and UPC_COMPANY_PREFIX before real distribution.');
    }

    // ---- Phase 1: scheduling + lifecycle.
    const parsedReleaseDate = releaseDate ? new Date(releaseDate) : null;
    const scheduled = isScheduledForLater(parsedReleaseDate);
    const initialStatus: ReleaseStatus = scheduled ? 'approved' : 'submitted';

    const release = {
      id: `REL-${Math.floor(Math.random() * 100000)}`,
      title: metadata.title || metadata.project_name || "Untitled Release",
      artist: metadata.artist || metadata.artist_name || "Unknown Artist",
      genre: metadata.genre || "Unknown Genre",
      audioUrl,
      artworkUrl,
      isrc,
      upc,
      releaseDate: parsedReleaseDate,
      metadata: { ...metadata, audioMeta, validationWarnings: warnings },
      platforms: (Array.isArray(platforms) ? platforms : [platforms || 'spotify']).map((p: any) => ({
        id: typeof p === 'string' ? p : p.id,
        name: typeof p === 'string' ? p.charAt(0).toUpperCase() + p.slice(1) : p.name,
        status: 'pending',
      })),
      status: initialStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await store.insertRelease(release);

    // Only kick off DSP delivery if not scheduled for later.
    if (!scheduled) {
      const job = await dspAdapter.deliver(release);
      logger.info({ releaseId: release.id, jobId: job.jobId, provider: dspAdapter.id }, 'release delivery started');
    }

    res.status(201).json({ ...release, warnings });
  });

  // ---- Phase 1: metadata edit on live releases (DDEX update message) ----
  app.patch("/api/releases/:id/metadata", async (req, res) => {
    const release = await store.getRelease(req.params.id);
    if (!release) return res.status(404).json({ error: 'Release not found' });

    const allowedFields = ['title', 'artist', 'genre', 'releaseDate', 'metadata'] as const;
    const changes: Record<string, unknown> = {};
    for (const k of allowedFields) {
      if (req.body[k] !== undefined) changes[k] = req.body[k];
    }
    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ error: 'no editable fields provided' });
    }

    // Only live / approved releases need a DDEX update message; drafts edit freely
    if (['live', 'delivering', 'approved'].includes(release.status)) {
      const result = await dspAdapter.updateMetadata(release, changes);
      if (!result.ok) {
        return res.status(502).json({ error: 'dsp_update_failed', note: 'DSP rejected the metadata update' });
      }
    }

    const updated = await store.patchRelease(req.params.id, changes);
    logAudit(req, {
      actorId: String(req.body?.actorId ?? release.userId ?? 'unknown'),
      action: 'release.metadata.edit',
      resource: release.id,
      metadata: { fields: Object.keys(changes) },
    });
    res.json(updated);
  });

  /**
   * Explicit lifecycle transitions. Validates via the state machine and
   * surfaces a clean 409 on illegal transitions.
   */
  app.post("/api/releases/:id/transition", async (req, res) => {
    const release = await store.getRelease(req.params.id);
    if (!release) return res.status(404).json({ error: 'Release not found' });
    const target = (req.body?.status ?? '') as ReleaseStatus;
    try {
      assertTransition(release.status as ReleaseStatus, target);
    } catch (err) {
      if (err instanceof ReleaseTransitionError) {
        return res.status(409).json({ error: err.message, from: err.from, to: err.to });
      }
      throw err;
    }
    const updated = await store.patchRelease(req.params.id, { status: target });
    res.json(updated);
  });

  /**
   * Takedown — convenience wrapper for live → taken_down.
   */
  app.post("/api/releases/:id/takedown", async (req, res) => {
    const release = await store.getRelease(req.params.id);
    if (!release) return res.status(404).json({ error: 'Release not found' });
    try {
      assertTransition(release.status as ReleaseStatus, 'taken_down');
    } catch (err) {
      if (err instanceof ReleaseTransitionError) {
        return res.status(409).json({ error: err.message });
      }
      throw err;
    }
    const reason = req.body?.reason || 'unspecified';
    // Notify the DSP adapter so the DDEX takedown message goes out
    await dspAdapter.takedown(release, reason);
    const updated = await store.patchRelease(req.params.id, {
      status: 'taken_down',
      metadata: { ...(release.metadata || {}), takedownReason: reason, takedownAt: new Date().toISOString() },
    });
    logAudit(req, {
      actorId: String(req.body?.actorId ?? release.userId ?? 'unknown'),
      action: 'release.takedown',
      resource: release.id,
      metadata: { reason },
    });
    res.json(updated);
  });

  app.get("/api/releases", async (_req, res) => {
    res.json(await store.listReleases());
  });

  app.get("/api/releases/:id", async (req, res) => {
    const r = await store.getRelease(req.params.id);
    if (r) res.json(r);
    else res.status(404).json({ error: "Release not found" });
  });

  app.patch("/api/releases/:id", validate(releasePatchSchema), async (req, res) => {
    const r = await store.patchRelease(req.params.id, req.body);
    if (r) res.json(r);
    else res.status(404).json({ error: "Release not found" });
  });

  // --- Campaign APIs ---
  app.post("/api/campaigns", validate(campaignCreateSchema), async (req, res) => {
    const { releaseId, goal, budget } = req.body;
    const release = (await store.getRelease(releaseId || '')) || { title: 'New Release', genre: 'Pop' };
    const plan = await generateStrategy((release as any).title, (release as any).genre);
    const influencers = await store.listInfluencers();
    plan.suggestedInfluencers = influencers.slice(0, 2);

    const campaign = {
      id: Date.now().toString(),
      releaseId,
      goal,
      budget,
      plan,
      status: 'draft',
      createdAt: new Date(),
    };
    await store.insertCampaign(campaign);
    res.status(201).json(campaign);
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    const c = await store.getCampaign(req.params.id);
    if (c) res.json(c);
    else res.status(404).json({ error: "Campaign not found" });
  });

  app.patch("/api/campaigns/:id/launch", async (req, res) => {
    const c = await store.patchCampaign(req.params.id, { status: 'active' });
    if (!c) return res.status(404).json({ error: "Campaign not found" });

    const suggested = (c.plan as any)?.suggestedInfluencers || [];
    for (const inf of suggested) {
      await store.insertInfluencerCampaign({
        id: Date.now().toString() + Math.random(),
        campaignId: c.id,
        influencerId: inf.id,
        status: 'pending',
      });
    }
    res.json(c);
  });

  // --- Influencer & DJ APIs ---
  app.get("/api/influencers", async (_req, res) => {
    res.json(await store.listInfluencers());
  });

  app.post("/api/influencers", validate(influencerCreateSchema), async (req, res) => {
    const influencer = {
      id: Date.now().toString(),
      ...req.body,
      status: 'READY',
      match: '95%',
      createdAt: new Date(),
    };
    await store.insertInfluencer(influencer);
    res.json(influencer);
  });

  app.post("/api/influencers/send", validate(influencerSendSchema), async (req, res) => {
    const { campaignId, influencerIds } = req.body;
    const sends = [];
    for (const infId of influencerIds) {
      const send = {
        id: Date.now().toString() + Math.random(),
        campaignId,
        influencerId: infId,
        status: 'sent',
        timestamp: new Date(),
      };
      await store.insertInfluencerCampaign(send);
      pushEvent({
        receiverId: infId,
        type: 'info',
        title: 'NEW_MISSION',
        message: `An artist has invited you to campaign ${campaignId}.`,
        href: '/influencer/missions',
      });
      sends.push(send);
    }
    res.json({ success: true, sends });
  });

  app.post("/api/djs/send", async (req, res) => {
    const log = { id: Date.now().toString(), ...req.body, status: 'sent', timestamp: new Date() };
    await store.insertDjSend(log);
    if (req.body?.djId) {
      pushEvent({
        receiverId: String(req.body.djId),
        type: 'info',
        title: 'PACK_RECEIVED',
        message: `New DJ pack from ${req.body.artistName ?? 'an artist'} ready for review.`,
        href: '/dj/packs',
      });
    }
    res.json({ success: true, message: "Pack transmitted to DJ terminals", log });
  });

  // --- Cross-portal inbox APIs ---
  app.get("/api/inbox/:userId", (req, res) => {
    res.json(listEventsFor(req.params.userId));
  });

  app.post("/api/inbox/:id/read", (req, res) => {
    const ok = markInboxRead(req.params.id);
    res.json({ ok });
  });

  // ---- Phase 7: GDPR / DMCA / audit endpoints ----
  app.get('/api/me/export', handleDataExport);
  app.delete('/api/me', handleDataDelete);
  app.post('/api/dmca', handleDmcaNotice);

  // Audit log read endpoint (admin only — but we don't gate yet because
  // there's no admin role enforcement; lock down before exposing publicly).
  app.get('/api/admin/audit', (req, res) => {
    const actorId = req.query.actorId as string | undefined;
    const action = req.query.action as string | undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 100;
    res.json({ events: listAuditEvents({ actorId, action, limit }) });
  });

  // --- Cross-portal direct messages ---
  app.get("/api/messages", (req, res) => {
    const role = String(req.query.role ?? 'ARTIST').toUpperCase() as MsgRole;
    const userId = String(req.query.userId ?? `viewer-${role.toLowerCase()}`);
    const threads = listThreadsForViewer(userId, role);
    res.json({ threads });
  });

  app.get("/api/messages/:threadId", (req, res) => {
    const thread = findThread(req.params.threadId);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    const msgs = listMessagesInThread(req.params.threadId);
    res.json({ thread, messages: msgs });
  });

  app.post("/api/messages/:threadId", (req, res) => {
    const { senderId, body } = req.body ?? {};
    if (!body || typeof body !== 'string') return res.status(400).json({ error: 'body required' });
    const msg = postMessage(req.params.threadId, String(senderId ?? 'viewer'), body);
    if (!msg) return res.status(404).json({ error: 'Thread not found' });
    res.json({ message: msg });
  });

  app.post("/api/messages/:threadId/read", (req, res) => {
    const role = String(req.body?.role ?? 'ARTIST').toUpperCase() as MsgRole;
    markThreadRead(req.params.threadId, role);
    res.json({ ok: true });
  });

  app.post("/api/splits", validate(splitCreateSchema), async (req, res) => {
    const splitRecord = { id: Date.now().toString(), ...req.body, paid: false, createdAt: new Date() };
    await store.insertSplit(splitRecord);
    res.json({ success: true, splitRecord });
  });

  // --- Assets API ---
  app.post("/api/assets/cover", async (req, res) => {
    const { prompt } = req.body;
    const images = await generateImage(prompt || "abstract music cover");
    res.json({ images });
  });

  app.post("/api/assets/video", async (req, res) => {
    const { prompt } = req.body;
    const video = await generateVideo(prompt || "music video teaser");
    res.json({ ...video, status: "done" });
  });

  app.post("/api/assets/ugc", (_req, res) => {
    res.json({ status: "processing", jobId: "ugc_" + Date.now() });
  });

  app.post("/api/assets/viral-ideas", async (req, res) => {
    const { title } = req.body;
    const ideas = await generateViralIdeas(title || "New Release");
    res.json({ ideas });
  });

  // --- Promo Pack APIs ---
  app.post("/api/promo/generate", validate(promoGenerateSchema), async (req, res) => {
    const { releaseId, type } = req.body;
    const assets = [
      { type: "meme", content: { text: "When the protocol hits different 😭🔥", visual: "Static glitch overlay" } },
      { type: "tiktok", content: { idea: "POV: You just heard this node at 2AM in the matrix", visual: "Neon city background" } },
    ];
    const pack = {
      id: "PROMO-" + Math.floor(Math.random() * 100000),
      releaseId: releaseId || "demo",
      type: type || "viral",
      assets,
      status: "generated",
      createdAt: new Date(),
    };
    await store.insertPromoPack(pack);
    res.json(pack);
  });

  app.get("/api/promo", async (_req, res) => {
    res.json(await store.listPromoPacks());
  });

  // --- UGC Studio APIs ---
  app.post("/api/ugc/generate", validate(ugcGenerateSchema), async (req, res) => {
    const { type, releaseId } = req.body;
    const asset = {
      id: "UGC-" + Math.floor(Math.random() * 100000),
      releaseId: releaseId || "demo",
      type: type || "lipsync",
      status: "queued",
      createdAt: new Date(),
    };
    await store.insertUgcAsset(asset);

    // Simulate async processing
    setTimeout(async () => {
      await store.patchUgcAsset(asset.id, { status: 'processing' });
      setTimeout(async () => {
        await store.patchUgcAsset(asset.id, {
          status: 'done',
          url: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
        });
      }, 4000);
    }, 1500);

    res.json(asset);
  });

  app.get("/api/ugc/:id", async (req, res) => {
    const asset = await store.getUgcAsset(req.params.id);
    if (!asset) return res.status(404).json({ error: "Not found" });
    res.json(asset);
  });

  app.post("/api/campaign/from-promo", async (req, res) => {
    const { packId, releaseId } = req.body;
    const pack = await store.getPromoPack(packId);
    if (!pack) return res.status(404).json({ error: "Pack not found" });
    const campaign = {
      id: "CAMP-" + Math.floor(Math.random() * 100000),
      releaseId: releaseId || pack.releaseId,
      goal: `Viral Launch: ${pack.type}`,
      status: "draft",
      plan: { objective: 'Viral launch', steps: [], suggestedInfluencers: [] },
      createdAt: new Date(),
    };
    await store.insertCampaign(campaign);
    res.json(campaign);
  });

  app.post("/api/automation", validate(automationSchema), async (req, res) => {
    const { releaseId, autoUGC, autoInfluencers, autoAds } = req.body;
    const automation = {
      releaseId,
      autoUGC: !!autoUGC,
      autoInfluencers: !!autoInfluencers,
      autoAds: !!autoAds,
      status: "active",
      updatedAt: new Date(),
    };
    await store.upsertAutomation(automation);
    res.json(automation);
  });

  app.get("/api/automation/:releaseId", async (req, res) => {
    const auto = await store.getAutomation(req.params.releaseId);
    res.json(auto || { autoUGC: false, autoInfluencers: false, autoAds: false });
  });

  /* ================================================================
   * PHASE 3 — MONEY FLOW
   * ================================================================ */

  // Onboard a payee (artist / influencer / DJ) for payouts.
  app.post('/api/connect/onboard', async (req, res) => {
    const { payeeEmail, payeeName, role, country, returnUrl } = req.body ?? {};
    if (!payeeEmail || !role) {
      return res.status(400).json({ error: 'payeeEmail and role required' });
    }
    try {
      const result = await payoutAdapter.onboardCreator({ payeeEmail, payeeName, role, country, returnUrl });
      memCreatorAccounts[payeeEmail] = {
        payeeEmail,
        payeeName,
        role,
        country,
        stripeAccountId: result.accountId,
        onboardingStatus: result.status,
        payoutsEnabled: result.status === 'active',
        provider: payoutAdapter.id,
        updatedAt: new Date(),
      };
      logAudit(req, { actorId: payeeEmail, action: 'connect.onboard', metadata: { role, provider: payoutAdapter.id } });
      res.json({ ok: true, ...result, provider: payoutAdapter.id });
    } catch (err) {
      logger.error({ err, payeeEmail }, 'connect onboard failed');
      res.status(500).json({ error: 'onboard_failed' });
    }
  });

  app.get('/api/connect/status/:payeeEmail', (req, res) => {
    const acct = memCreatorAccounts[req.params.payeeEmail];
    if (!acct) return res.status(404).json({ error: 'not_onboarded' });
    res.json(acct);
  });

  // CSV royalty ingestion. Accept the raw CSV text in the body.
  app.post('/api/royalties/ingest', express.text({ type: 'text/*', limit: '10mb' }), (req, res) => {
    const csvText = typeof req.body === 'string' ? req.body : (req.body?.csv ?? '');
    if (!csvText || typeof csvText !== 'string' || csvText.length < 20) {
      return res.status(400).json({ error: 'csv_required', note: 'POST CSV text directly with Content-Type: text/csv, or { "csv": "..." } as JSON' });
    }
    const source = String(req.query.source ?? 'manual');
    const lines = parseRoyaltyCsv(csvText, source);
    appendToLedger(lines);
    const summary = aggregateEarnings(lines);
    logAudit(req, { actorId: 'admin', action: 'royalty.ingest', metadata: { source, lines: lines.length, totalCents: summary.totalCents } });
    res.json({ ok: true, ingestedLines: lines.length, summary });
  });

  // Aggregated earnings — by release, payee, or anyone (admin)
  app.get('/api/earnings', (req, res) => {
    const releaseId = req.query.releaseId as string | undefined;
    const payeeEmail = req.query.payeeEmail as string | undefined;
    const lines = getLedger(releaseId ? { releaseId } : undefined);

    if (payeeEmail) {
      // Calculate this payee's share across all matching releases via splits
      // (We pull splits from in-memory store via the existing influencer/split tables)
      // Simpler approach: aggregate the entire ledger and apply splits if releaseId known.
      const summary = aggregateEarnings(lines);
      // We don't have per-payee filter on splits easily; return their total share if we have it
      return res.json({ payeeEmail, summary, message: 'Per-payee breakdown applies splits from /api/splits' });
    }
    const summary = aggregateEarnings(lines);
    res.json({ summary, lineCount: lines.length });
  });

  // Pay out a specific split row.
  app.post('/api/splits/:id/payout', async (req, res) => {
    // Find the split via the listing (in-memory store doesn't expose getSplit;
    // for now ingest body has all needed fields, real impl would look it up).
    const { payeeEmail, amountCents, releaseId, payeeName } = req.body ?? {};
    if (!payeeEmail || !amountCents) {
      return res.status(400).json({ error: 'payeeEmail and amountCents required' });
    }
    const acct = memCreatorAccounts[payeeEmail];
    if (!acct?.payoutsEnabled) {
      return res.status(412).json({ error: 'payee_not_onboarded', note: `Run /api/connect/onboard first for ${payeeEmail}` });
    }
    try {
      const result = await payoutAdapter.pay({
        payeeEmail,
        payeeAccountId: acct.stripeAccountId,
        amountCents: Number(amountCents),
        description: `DropKast payout · split ${req.params.id}${releaseId ? ` · release ${releaseId}` : ''}`,
        metadata: { splitId: req.params.id, releaseId },
      });
      const payout = {
        id: result.transferId ?? `PAY-${Date.now()}`,
        payeeEmail,
        payeeName,
        releaseId,
        splitId: req.params.id,
        amountCents: Number(amountCents),
        currency: 'USD',
        status: result.ok ? 'processing' : 'failed',
        provider: payoutAdapter.id,
        providerTransferId: result.transferId,
        createdAt: new Date(),
      };
      memPayouts[payout.id] = payout;
      logAudit(req, { actorId: payeeEmail, action: 'payout.created', resource: payout.id, metadata: { amountCents, splitId: req.params.id } });
      res.json({ ok: result.ok, payout, error: result.error });
    } catch (err) {
      logger.error({ err, payeeEmail }, 'payout failed');
      res.status(500).json({ error: 'payout_failed' });
    }
  });

  // Tax document download stub. Stripe Connect generates 1099s automatically;
  // we expose the link here when configured.
  app.get('/api/tax-docs/:payeeEmail', (req, res) => {
    const acct = memCreatorAccounts[req.params.payeeEmail];
    if (!acct) return res.status(404).json({ error: 'not_onboarded' });
    res.json({
      payeeEmail: req.params.payeeEmail,
      provider: payoutAdapter.id,
      documents: payoutAdapter.id === 'stripe'
        ? [{ year: new Date().getFullYear(), type: '1099-K', url: `https://dashboard.stripe.com/connect/accounts/${acct.stripeAccountId}/tax-documents` }]
        : [],
      note: payoutAdapter.id === 'stripe'
        ? 'Stripe issues 1099-K and 1042-S automatically once thresholds are met.'
        : 'Tax docs available once Stripe Connect is configured.',
    });
  });

  /* ================================================================
   * STRIPE WEBHOOKS — required when STRIPE_SECRET_KEY is set.
   * Verifies signature and updates payout/account status.
   * ================================================================ */
  app.post(
    '/api/webhooks/stripe',
    express.raw({ type: 'application/json' }),
    async (req: any, res: any) => {
      const sig = req.headers['stripe-signature'];
      const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!whSecret || !sig || !process.env.STRIPE_SECRET_KEY) {
        // Webhook not configured — return 200 so Stripe doesn't retry forever.
        return res.json({ received: true, configured: false });
      }
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });
        const event = stripe.webhooks.constructEvent(req.body, sig, whSecret);

        switch (event.type) {
          case 'account.updated': {
            const account = event.data.object;
            // Find the matching creator and flip payoutsEnabled
            for (const email of Object.keys(memCreatorAccounts)) {
              if (memCreatorAccounts[email].stripeAccountId === account.id) {
                memCreatorAccounts[email].payoutsEnabled = !!account.charges_enabled;
                memCreatorAccounts[email].onboardingStatus = account.charges_enabled ? 'active' : 'pending';
                logger.info({ email, accountId: account.id }, 'stripe webhook: account updated');
                break;
              }
            }
            break;
          }
          case 'transfer.paid':
          case 'transfer.failed': {
            const transfer = event.data.object;
            const payout = Object.values(memPayouts).find((p: any) => p.providerTransferId === transfer.id);
            if (payout) {
              (payout as any).status = event.type === 'transfer.paid' ? 'paid' : 'failed';
              (payout as any).updatedAt = new Date();
              logger.info({ payoutId: (payout as any).id, type: event.type }, 'stripe webhook: transfer status');
            }
            break;
          }
          // Subscription events — DropKast tier billing
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
          case 'invoice.paid':
          case 'invoice.payment_failed': {
            applyStripeSubscriptionEvent(event.type, event.data.object);
            break;
          }
          default:
            logger.debug({ type: event.type }, 'stripe webhook: ignored event type');
        }
        res.json({ received: true });
      } catch (err: any) {
        logger.error({ err: err.message }, 'stripe webhook: signature verify failed');
        res.status(400).json({ error: 'webhook_verify_failed' });
      }
    },
  );

  /* ================================================================
   * BILLING — Subscription tiers (Free / Indie / Pro / Label)
   * ================================================================ */
  // Get current subscription for the calling user.
  app.get('/api/billing/subscription', async (req: any, res: any) => {
    const userId = req.headers['x-user-id'] as string || 'anon';
    res.json(getSubRecord(userId));
  });

  // Create Stripe Checkout Session for a tier upgrade.
  app.post('/api/billing/checkout', async (req: any, res: any) => {
    const userId = req.headers['x-user-id'] as string || 'anon';
    const userEmail = (req.headers['x-user-email'] as string) || (req.body?.email) || `${userId}@dropkast.local`;
    const { tierId, period, trialDays } = req.body ?? {};
    if (!tierId || !period) {
      return res.status(400).json({ error: 'tierId and period required' });
    }
    const result = await createCheckoutSession({
      userId,
      userEmail,
      tierId,
      period,
      trialDays: trialDays || 14,
    });
    logAudit(req, { actorId: userId, action: 'billing.checkout.created', resource: tierId, metadata: { period } });
    res.json(result);
  });

  // Create Stripe customer portal session.
  app.post('/api/billing/portal', async (req: any, res: any) => {
    const userId = req.headers['x-user-id'] as string || 'anon';
    const result = await createPortalSession({ userId });
    res.json(result);
  });

  /* ================================================================
   * PHASE 4 — CREATOR ECONOMY
   * ================================================================ */

  // Real influencer matching (replaces slice(0,2) hack).
  app.post('/api/influencers/match', async (req, res) => {
    const { releaseId, limit, minScore } = req.body ?? {};
    const release = releaseId ? await store.getRelease(releaseId) : null;
    const releaseLite = release ?? {
      id: 'adhoc',
      title: req.body?.title,
      genre: req.body?.genre,
    };
    const roster = await store.listInfluencers();
    const ranked = matchInfluencers(releaseLite as any, roster as any, { limit, minScore });
    res.json({
      release: { id: releaseLite.id, title: (releaseLite as any).title, genre: (releaseLite as any).genre },
      matches: ranked,
    });
  });

  // Submit a post URL from an influencer for verification.
  app.post('/api/influencers/:id/verify-post', async (req, res) => {
    const { postUrl, campaignId, releaseId, expectedIsrc } = req.body ?? {};
    if (!postUrl) return res.status(400).json({ error: 'postUrl required' });

    const platform = detectPlatform(postUrl);
    const verifier = getPostVerifier(platform);
    const result = await verifier.verify({ postUrl, expectedReleaseId: releaseId, expectedIsrc });

    const record = {
      id: `VPOST-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      influencerId: req.params.id,
      campaignId,
      releaseId,
      platform,
      postUrl,
      verifiedAt: result.status === 'verified' ? new Date() : undefined,
      verifierProvider: verifier.id,
      status: result.status,
      metrics: result.metrics,
      createdAt: new Date(),
    };
    memVerifiedPosts.push(record);
    logAudit(req, {
      actorId: req.params.id,
      action: 'post.verify',
      resource: record.id,
      metadata: { platform, status: result.status, verifierProvider: verifier.id },
    });

    res.json({ ok: result.ok, post: record, verification: result });
  });

  app.get('/api/influencers/:id/posts', (req, res) => {
    res.json(memVerifiedPosts.filter((p) => p.influencerId === req.params.id));
  });

  // Generate a signed URL for a DJ to download a pack.
  app.post('/api/dj/packs/:packId/deliver', async (req, res) => {
    const { djId } = req.body ?? {};
    if (!djId) return res.status(400).json({ error: 'djId required' });

    const baseUrl = `${req.protocol}://${req.get('host')}/api/dj/packs/${req.params.packId}/download`;
    const signedUrl = signPackUrl({ baseUrl, packId: req.params.packId, djId, ttlSeconds: 60 * 60 * 24 * 7 });
    logAudit(req, { actorId: djId, action: 'pack.deliver', resource: req.params.packId });
    res.json({ ok: true, url: signedUrl, expiresInSeconds: 60 * 60 * 24 * 7 });
  });

  // Validate signed URL + return pack contents (stub — real impl streams the file).
  app.get('/api/dj/packs/:packId/download', (req, res) => {
    const v = verifyPackUrl({
      pack: req.query.pack as string,
      dj: req.query.dj as string,
      exp: req.query.exp as string,
      sig: req.query.sig as string,
    });
    if (!v.ok) {
      return res.status(403).json({ error: 'invalid_signature', reason: v.reason });
    }
    if (v.packId !== req.params.packId) {
      return res.status(403).json({ error: 'pack_mismatch' });
    }
    logAudit(req, { actorId: v.djId ?? 'unknown', action: 'pack.download', resource: v.packId });
    // Real: stream the file from R2/S3. Stub: return manifest of contents.
    res.json({
      ok: true,
      packId: v.packId,
      djId: v.djId,
      manifest: [
        { type: 'master', filename: 'master.wav', size: '~52MB' },
        { type: 'instrumental', filename: 'instrumental.wav', size: '~52MB' },
        { type: 'acapella', filename: 'acapella.wav', size: '~22MB' },
        { type: 'extended-mix', filename: 'extended.wav', size: '~58MB' },
      ],
      note: 'Stub manifest. Wire to R2 for streamed file delivery.',
    });
  });

  // Submit DJ feedback on a release.
  app.post('/api/dj/feedback', (req, res) => {
    const { djId, djName, releaseId, rating, comment, willPlayInSet } = req.body ?? {};
    if (!djId || !releaseId || !rating) {
      return res.status(400).json({ error: 'djId, releaseId, and rating required' });
    }
    const r = parseInt(String(rating), 10);
    if (Number.isNaN(r) || r < 1 || r > 5) {
      return res.status(400).json({ error: 'rating must be 1-5' });
    }
    const record = {
      id: `DJF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      djId, djName, releaseId,
      rating: r, comment, willPlayInSet: !!willPlayInSet,
      createdAt: new Date(),
    };
    memDjFeedback.push(record);
    logAudit(req, { actorId: djId, action: 'dj.feedback', resource: releaseId, metadata: { rating: r } });
    res.json({ ok: true, feedback: record });
  });

  // Aggregate DJ feedback into a chart-readiness signal.
  app.get('/api/releases/:id/dj-feedback', (req, res) => {
    const items = memDjFeedback.filter((f) => f.releaseId === req.params.id);
    if (items.length === 0) {
      return res.json({ releaseId: req.params.id, count: 0, avgRating: null, willPlayPct: 0, items: [] });
    }
    const sumR = items.reduce((s, x) => s + x.rating, 0);
    const willPlayCount = items.filter((x) => x.willPlayInSet).length;
    res.json({
      releaseId: req.params.id,
      count: items.length,
      avgRating: Number((sumR / items.length).toFixed(2)),
      willPlayPct: Math.round((willPlayCount / items.length) * 100),
      chartReadinessScore: Math.round(((sumR / items.length) / 5) * 50 + (willPlayCount / items.length) * 50),
      items,
    });
  });

  // Generic error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error('[API] unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', message: err?.message });
  });

  return app;
}
