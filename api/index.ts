import { createApiApp } from "./_app.js";

/**
 * Vercel serverless entry point.
 *
 * NOTE: This single monolithic import loads ALL dependencies (AI providers,
 * billing, email, sheets, DSP delivery, etc.) on every cold start even for
 * simple routes like health checks. For production, split into route-specific
 * serverless functions (e.g. /api/ai/*, /api/billing/*) using separate entry
 * files so each function only loads what it needs.
 *
 * Example structure:
 *   api/ai.ts  → import { createAiRouter } from './_ai-routes.js'
 *   api/billing.ts → import { createBillingRouter } from './_billing-routes.js'
 *   api/_app.ts → compose them with express().use(...)
 */
const app = createApiApp();

export default app;
