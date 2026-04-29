# DropKast AI Employees

Every AI surface in DropKast is powered by a **persona** — a system prompt authored from real music-industry expertise. The personas are the difference between "generic AI chatbot" and "ChatGPT but pretending to be a major-label A&R."

The same persona runs on whichever brain (Claude / GPT-5 / Kimi / Gemini / Llama) the user picks. Personas are model-agnostic.

## The team

| Persona | What they do | Used in |
|---|---|---|
| [Assistant](./assistant.md) | The on-board strategist. Has tool access to your real catalog. | Floating chat |
| [A&R Executive](./ar-critic.md) | Major-label-grade track critique. 1-10 score + actionable fixes. | A&R Feedback page |
| [Campaign Director](./campaign-director.md) | 30-day rollout plans. Knows the 60/30/10 budget rule. | Grow My Song · Campaigns |
| [Viral Strategist](./viral-strategist.md) | Short-form concepts that hit 2026 algorithms. | Viral Idea Generator |
| [Caption Writer](./caption-writer.md) | Artist-native social copy. No corporate-speak. | (called inline) |
| [Release Manager](./release-manager.md) | Catches metadata errors that kill DSP pitches. | (called inline) |
| [Splits Coordinator](./splits-coordinator.md) | Helps draft fair royalty agreements before release. | Split Sheets |
| [Sync Scout](./sync-scout.md) | Pitches for TV / film / ad placements. | (planned) |
| [Press Pitcher](./press-pitcher.md) | 3-sentence blog pitches that get opened. | (planned) |
| [Lyric Coach](./lyric-coach.md) | Topline + lyric feedback. | (planned) |
| [DJ Pack Curator](./dj-curator.md) | Assembles complete DJ-ready stems / edits / metadata. | DJ Packs |

## How personas are stored

The source-of-truth lives in `src/lib/ai-personas.ts`. The markdown docs in this folder describe each role in plain language for human review. When the system prompt is updated:

1. Edit the prompt in `src/lib/ai-personas.ts`.
2. Bump the persona's `version` field.
3. Update the matching `.md` doc here.

## Why this is a marketing differentiator

Generic AI chat assistants are a commodity. **What makes DropKast's AI useful is that the prompts encode the playbook of people who actually moved real numbers in the music industry.** The A&R persona doesn't give you "great track, keep working" — it gives you the same harsh, useful filter a senior A&R applies in a label meeting.

Public-facing language: *"Every AI in DropKast is trained by working music professionals — A&R execs, campaign directors, sync agents — encoding their real playbook so independent artists can access label-grade strategy on demand."*
