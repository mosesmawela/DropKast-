# Improvements Checklist

Issues I found while auditing the site. **Fixed in this push** at the top, **awaiting your approval** below — pick which ones to ship next, no need to ask one-by-one.

---

## ✅ Fixed in this push (already deployed)

- [x] **ModelPicker dropdown clipping** — was getting cut off by `overflow:hidden` on the AI Assistant chat panel and any other modal. Refactored to render via React Portal to `document.body` with absolute positioning relative to the trigger button. Resize/scroll-aware. Esc key + click-outside close it. Z-index 1000.
- [x] **AI Assistant first-message 503** — recommended default was Anthropic Sonnet, but no Anthropic key was set. The first message would error "AI not configured" before the user could even pick a different provider. Now on mount the assistant fetches `/api/ai/providers` and **smart-falls-back** to whichever provider IS configured (Anthropic → Groq → NVIDIA → Cerebras → OpenRouter, in priority order).
- [x] **/api/health endpoint** missing the free chat providers in its service map — fixed (NVIDIA / Groq / Cerebras / OpenRouter now reported).
- [x] **AI Models page clarity** — removed the dead "Premium $15/mo" card (linked to nowhere), reduced the 3-card preamble to 2 (System AI Free + BYOK), added a green "Live & Working Today" callout so artists know what works without a key.
- [x] **All routes return 200** — audited every sidebar link including new `/messages`, `/academy`, `/profile`, `/ai-providers`. None broken.

---

## 🔴 High-impact (ship next — approve which)

### 1. Stub buttons that just toast — make real or remove
The following buttons currently show a fake toast and do nothing useful. They need to be **wired to real backend actions** OR **hidden behind a "coming soon" disabled state**:

- [ ] `Dashboard.tsx:206` — stat tile click ("SURVEILLANCE_NODE synchronized") — should drill into analytics for that metric
- [ ] `Dashboard.tsx:311` — "LOG_WIPE" quick command — should clear releases or confirm dangerous action
- [ ] `Dashboard.tsx:329` — "METADATA_SYNC" — should trigger a real metadata refresh on user's releases
- [ ] `Campaigns.tsx:119` — "FILTERS_ACTIVE" advanced filter button — should open a filter panel
- [ ] `Influencers.tsx:342` — same advanced filter stub
- [ ] `DJs.tsx:315` — "Node maintenance in progress" — should be removed (it's just gaslighting the user)
- [ ] `creator/dj/Packs.tsx:92` — "DOWNLOAD_INITIATED" should actually return a signed URL to a stem file
- [ ] `creator/influencer/Campaigns.tsx:112` — "MISSION_ACCEPTED" should POST to a real `/api/influencers/missions/:id/accept` endpoint
- [ ] `creator/influencer/Socials.tsx:79+87` — "NODE_RECALIBRATED" / "SYNC_REQUESTED" — should connect TikTok/Meta OAuth
- [ ] `ANR.tsx` "Submit New Track" — currently posts hardcoded `track: 'New Submission'`. Needs a real form (track title + lyrics + bio + audio file)
- [ ] `Settings.tsx` Account Delete in Data tab — needs confirmation modal + real deletion

**Effort:** ~1 day each for the easy ones (Dashboard sync), 1 week for OAuth flows (Socials).
**Priority order I'd ship:** ANR submission form → Dashboard real sync → Pack downloads → mission accept → Socials OAuth.

### 2. AI Assistant polish
- [ ] Conversation history isn't persisted — refresh and you lose the thread. Save to localStorage (or `messages` table in Postgres when DB is wired).
- [ ] No way to clear the conversation. Add a small trash icon.
- [ ] No copy-message button on AI replies.
- [ ] Tool-call previews disappear too fast on streaming. Keep them visible above the message body.
- [ ] Mobile chat panel is full-width but the input is cramped. Try larger padding on `<sm`.

### 3. Tutorial robustness
- [ ] If a `data-tour` target doesn't exist (page hasn't mounted), the spotlight just disappears with no tooltip. Should skip to next step or wait.
- [ ] Tutorial auto-starts only on `/dashboard`. If user lands on `/` first time, they never see it. Trigger after first navigation to any authed route.
- [ ] Spotlight overlay sometimes flashes during navigation animations.

### 4. Welcome onboarding
- [ ] When user picks a portal at the end, they're routed but role isn't pre-applied — sidebar still shows artist nav until next reload. Force re-render or update Theme on portal pick.
- [ ] Color picker step doesn't preview the change live on the portal cards above. Live re-tinting would feel premium.

### 5. Notifications inbox
- [ ] Cross-portal events from `/api/influencers/send` and `/api/djs/send` write to `_inbox.ts` server-side, but the client-side `NotificationsDropdown` only reads its own localStorage inbox. The two aren't connected. Wire dropdown to poll `/api/inbox/:userId`.
- [ ] No "browser push" or email notification when offline.

---

## 🟡 Medium (improvements, not bugs)

### 6. Consolidation
- [ ] **Two separate "AI" pages** confuses users: `/ai-providers` (catalog) and `/academy` (course). Rename to `/models` and `/learn`, surface them clearly in nav.
- [ ] **Reactions / Promo Packs / UGC Studio / Content Lab** all overlap conceptually. Consider merging Promo Packs + UGC into a single "Content Studio" page.
- [ ] Sidebar at 17 items is still long for new users. Add a "Pinned" subset and a "More" expander.

### 7. Loading states
- [ ] Most pages don't have skeleton loaders — they pop in. Add `LoadingSkeleton` component used while TanStack Query is fetching.
- [ ] Generate buttons (cover, video, viral ideas) don't show a progress bar even though server-side has progressive states.

### 8. Forms
- [ ] **NewRelease.tsx** — uses uncontrolled inputs in places. Migrate to react-hook-form + Zod for client validation matching the server schema.
- [ ] **Login.tsx + Signup.tsx** don't validate email/password client-side before submit.
- [ ] **Settings → Custom hex color** picker validates hex format but doesn't reject obviously-bad colors (e.g. `#ffffff` on light theme = invisible).

### 9. Mobile polish
- [ ] AI Assistant button (bottom-right) on mobile partially overlaps with the iOS bottom safe area on some devices. Add `pb-[env(safe-area-inset-bottom)]`.
- [ ] Sidebar drawer width 85vw is fine but the close button is small — bump tap target.
- [ ] Tutorial tooltip can go off-screen on small phones — clamp to viewport better.

### 10. Performance
- [ ] Main bundle is **858kB minified / 248kB gzipped**. Vite warns. Lazy-load `recharts` (its `CategoricalChart` is 295kB alone) — only load on Analytics page.
- [ ] Welcome screen + Dashboard load all at once. Code-split.
- [ ] Images on Influencers / Reactions pages don't have width/height attrs → CLS issues.

---

## 🟢 Nice-to-have (future)

### 11. Accessibility
- [ ] No `<main role="main">` landmark on pages.
- [ ] AI Assistant chat lacks live region for screen readers.
- [ ] Color contrast on `text-white/30` and `text-white/40` fails WCAG AA on dark theme. Audit with axe.
- [ ] Focus rings stripped via `focus:outline-none` everywhere — re-add visible focus-visible states.

### 12. Internationalization
- [ ] All copy is English. Add an `i18n` setup with at least Spanish + Portuguese for LATAM artists.
- [ ] Currency hardcoded to USD in Treasury / Stripe.

### 13. Admin tools
- [ ] No admin dashboard. Need one for: viewing top AI spenders, manual A&R review queue, takedown approvals, user search.

### 14. Analytics
- [ ] Real per-release deep-dive page exists but pulls from mock data. Wire to `/api/analytics/:releaseId` (already built).
- [ ] No chart for AI usage / cost over time — would help leadership monitor budget.

### 15. SEO + Sharing
- [ ] No OG meta tags — sharing the Vercel URL on Twitter/Discord shows nothing.
- [ ] No `sitemap.xml` / `robots.txt`. Even though the app is mostly authed, the marketing landing page (`/`) should be indexable.

---

## 🛡️ Security & ops

### 16. Pre-launch security
- [ ] Add rate limiting on `/api/ai/*` and `/api/auth/*` (Upstash Ratelimit or Vercel Edge Middleware).
- [ ] Sanitize all user-submitted content displayed in chat / messages — currently raw HTML escape is only in Academy lesson renderer.
- [ ] Add CSP headers via `vercel.json` — currently none.
- [ ] Stripe webhook signature verification (when Stripe wired).
- [ ] Add `noindex` to authed routes so Google doesn't index `/dashboard`.

### 17. Observability
- [ ] No Sentry. A single uncaught error in production kills a session silently.
- [ ] No structured logs — Vercel logs are flat strings. Add Pino with JSON output.
- [ ] No `/api/health` automated ping. Set up a Better Uptime / OneUptime ping.

---

## ⚪ Tech debt

### 18. Type safety
- [ ] ~30 `any` types still in `api/_app.ts` and `api/_store.ts`. Replace with Drizzle inferred types.
- [ ] `tsconfig.json` not `strict: true`. Flip the flag and fix the fallout (~50 errors expected).

### 19. Dead code
- [ ] `src/server/` directory has Express + Auth middleware that nothing imports. Delete.
- [ ] `src/features/assets/StudioModelSelector.tsx` and friends are now redundant since `ModelPicker` handles that. Audit and delete.

### 20. Tests
- [ ] Zero tests. Need at minimum: API smoke tests for every route, ModelPicker render test, validation schema tests.

---

## Approval workflow

Reply with the numbers you want shipped next (e.g. "1, 2, 5") and I'll fix them in one go without back-and-forth. Or say "ship 🔴 high-impact only" and I'll knock down the entire **High-impact** section.

Conservative recommendation: knock out **#1 (stub buttons)** and **#5 (notifications wiring)** next — those are the most user-visible bugs left. Everything else can wait until real users find them.
