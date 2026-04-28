import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { generateStrategy, generateViralIdeas, generateImage, generateVideo } from "./src/services/aiService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy Cloudinary Setup
let uploadMiddleware: any = null;

function getUploadMiddleware() {
  if (uploadMiddleware) return uploadMiddleware;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const storage = new CloudinaryStorage({
      cloudinary: cloudinary as any,
      params: {
        folder: "newdistro",
        resource_type: "auto",
      } as any,
    });

    uploadMiddleware = multer({ storage });
  } else {
    // Fallback to local memory storage for demo if no keys
    console.warn("Cloudinary keys missing. Falling back to memory storage.");
    uploadMiddleware = multer({ storage: multer.memoryStorage() });
  }

  return uploadMiddleware;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock database
  const db = {
    campaigns: [] as any[],
    influencerSends: [] as any[],
    djSends: [] as any[],
    splits: [] as any[],
    anrSubmissions: [] as any[],
    releases: [] as any[],
    influencers: [
      { id: '1', name: 'Alex Wave', platform: 'TikTok', reach: '1.2M', genre: 'Dark Pop', match: '98%', status: 'READY', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop' },
      { id: '2', name: 'Sasha Sun', platform: 'Instagram', reach: '450K', genre: 'Electronic', match: '92%', status: 'READY', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop' },
      { id: '3', name: 'VibeCheck', platform: 'TikTok', reach: '2.5M', genre: 'Indie', match: '88%', status: 'READY', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop' },
      { id: '4', name: 'BeatRadar', platform: 'YouTube', reach: '800K', genre: 'Pop', match: '85%', status: 'READY', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
      { id: '5', name: 'Luna Beats', platform: 'TikTok', reach: '3.1M', genre: 'Hyperpop', match: '95%', status: 'READY', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
      { id: '6', name: 'SynthLord', platform: 'Instagram', reach: '120K', genre: 'Synthwave', match: '94%', status: 'READY', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
    ],
    influencerCampaigns: [] as any[],
    promoPacks: [] as any[],
    ugcAssets: [] as any[],
    automations: [] as any[],
    analytics: [] as any[],
    preReleases: [] as any[], // New: Pre-release activations storage
  };

  const upload = getUploadMiddleware();

  // --- Pre-Release APIs ---
  app.get("/api/pre-releases", (req, res) => {
    res.json(db.preReleases);
  });

  app.post("/api/pre-releases", (req, res) => {
    const activation = {
      id: `PRE-${Date.now()}`,
      userId: 'user-1',
      title: req.body.title,
      hookStart: req.body.hookStart,
      hookEnd: req.body.hookEnd,
      creators: req.body.creators || [],
      status: req.body.status || 'draft',
      releaseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 14 days out
      createdAt: new Date()
    };
    db.preReleases.push(activation);
    res.json(activation);
  });

  app.post("/api/pre-release/:id/tiktok", (req, res) => {
    const ideas = [
      {
        type: "POV",
        idea: "POV: you hear this at a party",
        title: "The Party Paradox",
        caption: "WAIT FOR THE DROP 👀 #newmusic #viral",
      },
      {
        type: "Dance",
        idea: "Simple 3-step transition challenge",
        title: "Sync Sequence",
        caption: "Try this sequence with your squad ⚡ #DropKast #challenge",
      },
      {
        type: "Trend",
        idea: "High-contrast glitch transition trend",
        title: "Glitch Shift",
        caption: "Entering the next dimension. 🌐 #Transition #Edit",
      }
    ];
    res.json({ ideas });
  });

  app.post("/api/pre-release/:id/invasion", (req, res) => {
    const { id } = req.params;
    const activation = db.preReleases.find((r: any) => r.id === id);
    if (activation) {
      activation.status = 'invading';
    }
    // Simulate creator notification
    console.log(`[INVASION_MODE] Coordinated signal broadcast initiated for ${id}. Seeding creators...`);
    res.json({ status: "success", strategy: "coordinated_burst" });
  });

  // --- Analytics APIs ---
  app.post("/api/analytics/track", (req, res) => {
    const event = {
      id: `EVT-${Date.now()}`,
      userId: req.body.userId || 'anonymous',
      releaseId: req.body.releaseId,
      type: req.body.type, // play, click, post, influencer_post
      platform: req.body.platform,
      value: req.body.value || 1,
      timestamp: new Date()
    };
    db.analytics.push(event);
    res.json({ ok: true, event });
  });

  app.get("/api/analytics/:releaseId", (req, res) => {
    const { releaseId } = req.params;
    const events = db.analytics.filter((e: any) => e.releaseId === releaseId);
    
    const summary = {
      plays: events.filter((e: any) => e.type === 'play').length,
      clicks: events.filter((e: any) => e.type === 'click').length,
      influencerPosts: events.filter((e: any) => e.type === 'influencer_post').length,
      totalReach: events.reduce((acc: number, e: any) => acc + (e.value || 0), 0)
    };
    
    res.json(summary);
  });

  // --- Release APIs ---
  const processRelease = async (id: string) => {
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    
    await delay(5000); 
    
    const index = db.releases.findIndex(r => r.id === id);
    if (index === -1) return;

    db.releases[index].status = 'distributed';
    db.releases[index].updatedAt = new Date();

    for (let i = 0; i < db.releases[index].platforms.length; i++) {
      await delay(2000);
      const platform = db.releases[index].platforms[i];
      db.releases[index].platforms[i] = {
        ...platform,
        status: Math.random() > 0.1 ? 'live' : 'failed',
        updatedAt: new Date()
      };
    }

    db.releases[index].status = 'live';
    db.releases[index].updatedAt = new Date();
  };

  app.post("/api/releases", upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "artwork", maxCount: 1 },
  ]), (req: any, res) => {
    // req.body contains text fields, req.files contains file info
    const { platforms, ...metadata } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const audioUrl = files?.['audio']?.[0]?.path || "https://example.com/mock-audio.wav";
    const artworkUrl = files?.['artwork']?.[0]?.path || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=3270";
    
    const release = { 
      id: `REL-${Math.floor(Math.random() * 100000)}`, 
      ...metadata,
      title: metadata.title || metadata.project_name || "Untitled Release",
      artist: metadata.artist || metadata.artist_name || "Unknown Artist",
      genre: metadata.genre || "Unknown Genre",
      audioUrl,
      artworkUrl,
      platforms: (Array.isArray(platforms) ? platforms : [platforms || 'spotify']).map((p: any) => ({
        id: typeof p === 'string' ? p : p.id,
        name: typeof p === 'string' ? p.charAt(0).toUpperCase() + p.slice(1) : p.name,
        status: 'pending'
      })),
      status: 'processing',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    db.releases.push(release);
    processRelease(release.id);
    res.status(201).json(release);
  });

  app.get("/api/releases", (req, res) => {
    res.json(db.releases);
  });

  app.get("/api/releases/:id", (req, res) => {
    const release = db.releases.find(r => r.id === req.params.id);
    if (release) {
      res.json(release);
    } else {
      res.status(404).json({ error: "Release not found" });
    }
  });

  app.patch("/api/releases/:id", (req, res) => {
    const index = db.releases.findIndex(r => r.id === req.params.id);
    if (index !== -1) {
      db.releases[index] = { ...db.releases[index], ...req.body, updatedAt: new Date() };
      res.json(db.releases[index]);
    } else {
      res.status(404).json({ error: "Release not found" });
    }
  });

  // --- Campaign APIs ---
  app.post("/api/campaigns", async (req, res) => {
    const { releaseId, goal, budget } = req.body;

    const release = db.releases.find(r => r.id === releaseId) || { title: "New Release", genre: "Pop" };
    
    // AI Plan Generation
    const plan = await generateStrategy(release.title || release.project_name, release.genre);
    plan.suggestedInfluencers = db.influencers.length > 0 ? db.influencers.slice(0, 2) : [];

    const campaign = { 
      id: Date.now().toString(), 
      releaseId,
      goal,
      budget,
      plan,
      status: 'draft',
      createdAt: new Date() 
    };
    db.campaigns.push(campaign);
    res.status(201).json(campaign);
  });

  app.get("/api/campaigns/:id", (req, res) => {
    const campaign = db.campaigns.find(c => c.id === req.params.id);
    if (campaign) res.json(campaign);
    else res.status(404).json({ error: "Campaign not found" });
  });

  app.patch("/api/campaigns/:id/launch", (req, res) => {
    const index = db.campaigns.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
      db.campaigns[index].status = 'active';
      db.campaigns[index].updatedAt = new Date();
      
      // Auto-trigger influencer sends for demo
      const campaign = db.campaigns[index];
      campaign.plan.suggestedInfluencers.forEach((inf: any) => {
        db.influencerCampaigns.push({
          id: Date.now().toString() + Math.random(),
          campaignId: campaign.id,
          influencerId: inf.id,
          status: 'pending'
        });
      });

      res.json(db.campaigns[index]);
    } else {
      res.status(404).json({ error: "Campaign not found" });
    }
  });

  // --- Influencer & DJ APIs ---
  app.get("/api/influencers", (req, res) => {
    res.json(db.influencers);
  });

  app.post("/api/influencers", (req, res) => {
    const influencer = {
      id: Date.now().toString(),
      ...req.body,
      status: 'READY',
      match: '95%',
      createdAt: new Date()
    };
    db.influencers.push(influencer);
    res.json(influencer);
  });

  app.post("/api/influencers/send", (req, res) => {
    const { campaignId, influencerIds } = req.body;
    
    const sends = influencerIds.map((infId: string) => {
      const send = {
        id: Date.now().toString() + Math.random(),
        campaignId,
        influencerId: infId,
        status: 'sent',
        timestamp: new Date()
      };
      db.influencerCampaigns.push(send);
      return send;
    });

    res.json({ success: true, sends });
  });

  app.post("/api/djs/send", (req, res) => {
    const log = { id: Date.now().toString(), ...req.body, status: 'sent', timestamp: new Date() };
    db.djSends.push(log);
    res.json({ success: true, message: "Pack transmitted to DJ terminals", log });
  });

  // --- Splits API ---
  app.post("/api/splits", (req, res) => {
    const splitRecord = { id: Date.now().toString(), ...req.body, createdAt: new Date() };
    db.splits.push(splitRecord);
    res.json({ success: true, splitRecord });
  });

  // --- A&R API ---
  app.post("/api/anr", (req, res) => {
    const submission = { id: Date.now().toString(), ...req.body, status: 'pending', createdAt: new Date() };
    db.anrSubmissions.push(submission);
    res.json({ success: true, submission });
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

  app.post("/api/assets/ugc", (req, res) => {
    res.json({ status: "processing", jobId: "ugc_" + Date.now() });
  });

  app.post("/api/assets/viral-ideas", async (req, res) => {
    const { title } = req.body;
    const ideas = await generateViralIdeas(title || "New Release");
    res.json({ ideas });
  });

  // --- Promo Pack APIs ---
  app.post("/api/promo/generate", (req: any, res) => {
    const { releaseId, type } = req.body;
    
    const assets = [
      {
        type: "meme",
        content: { text: "When the protocol hits different 😭🔥", visual: "Static glitch overlay" },
      },
      {
        type: "tiktok",
        content: { idea: "POV: You just heard this node at 2AM in the matrix", visual: "Neon city background" },
      },
    ];

    const pack = {
      id: "PROMO-" + Math.floor(Math.random() * 100000),
      releaseId: releaseId || "demo",
      type: type || "viral",
      assets,
      status: "generated",
      createdAt: new Date(),
    };

    db.promoPacks.push(pack);
    res.json(pack);
  });

  app.get("/api/promo", (req, res) => {
    res.json(db.promoPacks);
  });

  // --- UGC Studio APIs ---
  app.post("/api/ugc/generate", (req, res) => {
    const { type, releaseId } = req.body;
    
    const asset = {
      id: "UGC-" + Math.floor(Math.random() * 100000),
      releaseId: releaseId || "demo",
      type: type || "lipsync",
      status: "queued",
      createdAt: new Date(),
    };

    db.ugcAssets.push(asset);

    // Simulate Job Processing
    setTimeout(() => {
      const found = db.ugcAssets.find((a: any) => a.id === asset.id);
      if (found) {
        found.status = "processing";
        setTimeout(() => {
          found.status = "done";
          found.url = "https://samplelib.com/lib/preview/mp4/sample-5s.mp4";
        }, 4000);
      }
    }, 1500);

    res.json(asset);
  });

  app.get("/api/ugc/:id", (req, res) => {
    const asset = db.ugcAssets.find((a: any) => a.id === req.params.id);
    if (!asset) return res.status(404).json({ error: "Not found" });
    res.json(asset);
  });

  // --- Campaign from Promo ---
  app.post("/api/campaign/from-promo", (req, res) => {
    const { packId, releaseId } = req.body;
    const pack = db.promoPacks.find((p: any) => p.id === packId);
    
    if (!pack) return res.status(404).json({ error: "Pack not found" });

    const campaign = {
      id: "CAMP-" + Math.floor(Math.random() * 100000),
      releaseId: releaseId || pack.releaseId,
      name: `Viral Launch: ${pack.type}`,
      status: "draft",
      assets: pack.assets,
      createdAt: new Date()
    };

    db.campaigns.push(campaign);
    res.json(campaign);
  });

  // --- Automation APIs ---
  app.post("/api/automation", (req, res) => {
    const { releaseId, autoUGC, autoInfluencers, autoAds } = req.body;
    const existingIdx = db.automations.findIndex((a: any) => a.releaseId === releaseId);
    
    const automation = {
      releaseId,
      autoUGC,
      autoInfluencers,
      autoAds,
      status: "active",
      updatedAt: new Date()
    };

    if (existingIdx > -1) db.automations[existingIdx] = automation;
    else db.automations.push(automation);

    res.json(automation);
  });

  app.get("/api/automation/:releaseId", (req, res) => {
    const auto = db.automations.find((a: any) => a.releaseId === req.params.releaseId);
    res.json(auto || { autoUGC: false, autoInfluencers: false, autoAds: false });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DROPKAST runtime online at http://localhost:${PORT}`);
  });
}

startServer();
