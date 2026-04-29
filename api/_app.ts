import express from "express";
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
  app.use(express.json({ limit: '4mb' }));

  const upload = getUploadMiddleware();

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      time: new Date().toISOString(),
      services: {
        anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
        nvidia: Boolean(process.env.NVIDIA_API_KEY),
        groq: Boolean(process.env.GROQ_API_KEY),
        cerebras: Boolean(process.env.CEREBRAS_API_KEY),
        openrouter: Boolean(process.env.OPENROUTER_API_KEY),
        cloudinary: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
        database: Boolean(process.env.DATABASE_URL),
        supabase: Boolean(process.env.VITE_SUPABASE_URL),
      },
    });
  });

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

  // --- Release lifecycle simulation ---
  const processRelease = async (id: string) => {
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    await delay(5000);
    const release = await store.getRelease(id);
    if (!release) return;

    await store.patchRelease(id, { status: 'distributed' });
    const updatedPlatforms = [...(release.platforms || [])];
    for (let i = 0; i < updatedPlatforms.length; i++) {
      await delay(2000);
      updatedPlatforms[i] = {
        ...updatedPlatforms[i],
        status: Math.random() > 0.1 ? 'live' : 'failed',
        updatedAt: new Date(),
      };
      await store.patchRelease(id, { platforms: updatedPlatforms });
    }
    await store.patchRelease(id, { status: 'live', platforms: updatedPlatforms });
  };

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

    // Only kick off the simulated DSP delivery if not scheduled for later.
    if (!scheduled) {
      processRelease(release.id);
    }

    res.status(201).json({ ...release, warnings });
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
    const updated = await store.patchRelease(req.params.id, {
      status: 'taken_down',
      metadata: { ...(release.metadata || {}), takedownReason: req.body?.reason || 'unspecified' },
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

  // Generic error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error('[API] unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', message: err?.message });
  });

  return app;
}
