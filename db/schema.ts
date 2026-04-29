import { pgTable, text, timestamp, integer, jsonb, boolean, uuid, real } from 'drizzle-orm/pg-core';

// Users / artists
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  artistName: text('artist_name'),
  role: text('role').notNull().default('ARTIST'), // ARTIST | INFLUENCER | DJ
  avatar: text('avatar'),
  stripeAccountId: text('stripe_account_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Releases
export const releases = pgTable('releases', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  genre: text('genre'),
  audioUrl: text('audio_url'),
  artworkUrl: text('artwork_url'),
  isrc: text('isrc'),
  upc: text('upc'),
  releaseDate: timestamp('release_date'),
  status: text('status').notNull().default('draft'), // draft|submitted|in_review|approved|delivering|live|rejected
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  platforms: jsonb('platforms').$type<Array<{ id: string; name: string; status: string; updatedAt?: Date }>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Campaigns
export const campaigns = pgTable('campaigns', {
  id: text('id').primaryKey(),
  releaseId: text('release_id').references(() => releases.id),
  goal: text('goal'),
  budget: real('budget'),
  plan: jsonb('plan').$type<{ objective: string; steps: Array<{ day: number; action: string; type: string }>; suggestedInfluencers?: unknown[] }>(),
  status: text('status').notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Influencers
export const influencers = pgTable('influencers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  platform: text('platform').notNull(),
  reach: text('reach'),
  genre: text('genre'),
  match: text('match'),
  status: text('status').notNull().default('READY'),
  avatar: text('avatar'),
  stripeAccountId: text('stripe_account_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Influencer ↔ campaign bridge
export const influencerCampaigns = pgTable('influencer_campaigns', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id'),
  influencerId: text('influencer_id'),
  status: text('status').notNull().default('pending'),
  postUrl: text('post_url'),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// DJ sends / packs
export const djSends = pgTable('dj_sends', {
  id: text('id').primaryKey(),
  releaseId: text('release_id'),
  djId: text('dj_id'),
  status: text('status').notNull().default('sent'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Royalty splits
export const splits = pgTable('splits', {
  id: text('id').primaryKey(),
  releaseId: text('release_id'),
  payeeEmail: text('payee_email').notNull(),
  payeeName: text('payee_name'),
  percentage: real('percentage').notNull(),
  paid: boolean('paid').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// A&R submissions + Claude critiques
export const anrSubmissions = pgTable('anr_submissions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id'),
  releaseId: text('release_id'),
  trackTitle: text('track_title'),
  notes: text('notes'),
  status: text('status').notNull().default('pending'),
  critique: jsonb('critique').$type<{ markdown: string; score?: number; tags?: string[] }>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Promo packs
export const promoPacks = pgTable('promo_packs', {
  id: text('id').primaryKey(),
  releaseId: text('release_id'),
  type: text('type'),
  assets: jsonb('assets').$type<Array<{ type: string; content: Record<string, unknown> }>>(),
  status: text('status').notNull().default('generated'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// UGC assets
export const ugcAssets = pgTable('ugc_assets', {
  id: text('id').primaryKey(),
  releaseId: text('release_id'),
  type: text('type'),
  status: text('status').notNull().default('queued'),
  url: text('url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Automation flags
export const automations = pgTable('automations', {
  releaseId: text('release_id').primaryKey(),
  autoUGC: boolean('auto_ugc').notNull().default(false),
  autoInfluencers: boolean('auto_influencers').notNull().default(false),
  autoAds: boolean('auto_ads').notNull().default(false),
  status: text('status').notNull().default('inactive'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Analytics events
export const analyticsEvents = pgTable('analytics_events', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  releaseId: text('release_id'),
  type: text('type').notNull(), // play | click | post | influencer_post
  platform: text('platform'),
  value: real('value').notNull().default(1),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

// Pre-releases
export const preReleases = pgTable('pre_releases', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  title: text('title'),
  hookStart: real('hook_start'),
  hookEnd: real('hook_end'),
  creators: jsonb('creators').$type<unknown[]>(),
  status: text('status').notNull().default('draft'),
  releaseDate: text('release_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Royalty ledger — every line item from DSP statements (per stream / sale / etc)
export const royaltyLines = pgTable('royalty_lines', {
  id: text('id').primaryKey(),
  releaseId: text('release_id'),
  isrc: text('isrc'),
  upc: text('upc'),
  platform: text('platform'),                  // spotify | apple | etc
  territory: text('territory'),                // ISO country code
  period: text('period'),                      // YYYY-MM
  quantity: integer('quantity').notNull().default(0),  // streams or units
  amountCents: integer('amount_cents').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  source: text('source'),                      // CSV filename / partner name
  ingestedAt: timestamp('ingested_at').notNull().defaultNow(),
});

// Payouts — actual or simulated transfers to a payee
export const payouts = pgTable('payouts', {
  id: text('id').primaryKey(),
  payeeEmail: text('payee_email').notNull(),
  releaseId: text('release_id'),
  splitId: text('split_id'),
  amountCents: integer('amount_cents').notNull(),
  currency: text('currency').notNull().default('USD'),
  status: text('status').notNull().default('pending'), // pending | processing | paid | failed
  provider: text('provider').notNull().default('simulator'),  // simulator | stripe
  providerTransferId: text('provider_transfer_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  paidAt: timestamp('paid_at'),
});

// Connect (Stripe / similar) account info per payee
export const creatorAccounts = pgTable('creator_accounts', {
  payeeEmail: text('payee_email').primaryKey(),
  payeeName: text('payee_name'),
  role: text('role'),                                  // ARTIST | INFLUENCER | DJ
  stripeAccountId: text('stripe_account_id'),
  onboardingStatus: text('onboarding_status').notNull().default('pending'),  // pending | active | restricted
  payoutsEnabled: boolean('payouts_enabled').notNull().default(false),
  country: text('country'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// DJ feedback per release — feeds chart-readiness aggregate
export const djFeedback = pgTable('dj_feedback', {
  id: text('id').primaryKey(),
  djId: text('dj_id').notNull(),
  djName: text('dj_name'),
  releaseId: text('release_id').notNull(),
  rating: integer('rating').notNull(),                 // 1-5
  comment: text('comment'),
  willPlayInSet: boolean('will_play_in_set'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Verified influencer posts — TikTok/Meta API verifies these before payout
export const verifiedPosts = pgTable('verified_posts', {
  id: text('id').primaryKey(),
  influencerId: text('influencer_id').notNull(),
  campaignId: text('campaign_id'),
  releaseId: text('release_id'),
  platform: text('platform'),                          // tiktok | instagram | reels | shorts
  postUrl: text('post_url').notNull(),
  postedAt: timestamp('posted_at'),
  verifiedAt: timestamp('verified_at'),
  verifierProvider: text('verifier_provider').notNull().default('manual'), // manual | tiktok | meta
  status: text('status').notNull().default('pending'), // pending | verified | rejected
  metrics: jsonb('metrics').$type<{ views?: number; likes?: number; shares?: number; saves?: number }>(),
  payoutCents: integer('payout_cents'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// AI usage budget per user (cost guardrail)
export const aiUsage = pgTable('ai_usage', {
  userId: uuid('user_id').primaryKey(),
  inputTokens: integer('input_tokens').notNull().default(0),
  outputTokens: integer('output_tokens').notNull().default(0),
  cachedTokens: integer('cached_tokens').notNull().default(0),
  costCents: integer('cost_cents').notNull().default(0),
  resetAt: timestamp('reset_at').notNull().defaultNow(),
});
