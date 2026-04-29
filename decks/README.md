# DropKast · Decks

Self-contained HTML pitch decks. Each file is a single document — open it in any browser, full-screen with `F`.

## `dropkast-pitch-deck.html`

**1920×1080 · 15 slides · April 2026 investor brief**

Auto-scales to any viewport while preserving aspect ratio. Designed for projector and laptop alike.

### Controls

| Key | Action |
|---|---|
| `←` `→` `Space` `PageUp` `PageDown` | Prev / Next |
| `Home` `End` | First / Last slide |
| `F` | Toggle fullscreen |
| `P` | Print (saves a 1920×1080 PDF) |

### Slide map

1. **Cover** — DROPKAST identity + tagline
2. **The Problem** — Indie artists pay for 7 tools to do what 1 should
3. **The Solution** — Vertical stack diagram
4. **Three Portals** — Artist / Creator / DJ
5. **Features Grid** — 6 capabilities
6. **AI Brains** — 8 swappable models (free + premium)
7. **Music-Pro Personas** — 11 AI employees, the differentiator
8. **Live Product** — Status + browser mockup
9. **Architecture** — Client / Edge / Data tiers
10. **Business Model** — Free / Premium / Per-Release pricing
11. **Unit Economics** — Break-even at 80 paying artists
12. **Roadmap** — 8-week plan with status
13. **Cost At Scale** — 50 → 50K artists projection
14. **Funding Ask** — $76K conservative / $194K acceleration
15. **Close** — Live demo, source, contact

### Linking to a specific slide

Append `#slide=N` to the URL:
- `dropkast-pitch-deck.html#slide=06` — jump to AI Brains slide
- `dropkast-pitch-deck.html#slide=11` — jump to Unit Economics

Useful for sharing a single slide via Loom / screen recording / email.

### Exporting to PDF

Press `P` while the deck is open in Chrome. Set destination to "Save as PDF", layout Landscape, custom paper size 1920×1080, margins None. The deck has print-styles so all 15 slides export as separate pages.

### Source data

Slide content draws directly from these repo docs — keep them in sync if you regenerate:
- [`README.md`](../README.md) — feature highlights, tech stack
- [`BUDGET_PLAN.md`](../BUDGET_PLAN.md) — cost projections, funding scenarios
- [`IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md) — roadmap phases
- [`CONNECTIONS_NEEDED.md`](../CONNECTIONS_NEEDED.md) — provider list
- [`personas/`](../personas/) — AI employee descriptions
