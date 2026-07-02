# DropKast — WhatsApp Bot + AI Split-Sheet setup

Two features ship with env-based config. Nothing is hard-coded; add the keys
below to your server env (Vercel → Project → Settings → Environment Variables,
or `.env` locally) and they light up.

---

## 1. WhatsApp submission bot (Twilio)

Artists submit music from WhatsApp via a conversational onboarding. The bot
collects artist name → track → genre → release date → links → audio, confirms,
then files the submission into DropKast's A&R pipeline (same as the web form)
and emails moses@lvrn.com.

### Env vars
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886   # sandbox number, or your own
```
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` are only needed to **download audio
  attachments** the artist sends (Twilio media URLs require auth). Text replies
  work without them (we reply with TwiML).

### Fastest path — Twilio Sandbox (live in ~5 min)
1. Create a free Twilio account → Console → **Messaging → Try it out → Send a
   WhatsApp message**. You'll get a sandbox number (e.g. `+1 415 523 8886`) and a
   join code like `join <two-words>`.
2. On your phone, WhatsApp that number and send `join <two-words>` to opt in.
3. In the sandbox settings, set **"When a message comes in"** to:
   ```
   https://dropkast.lvrn.dev/api/whatsapp/webhook      (POST)
   ```
   (For local testing, run `ngrok http 4002` and use the ngrok URL.)
4. Message the sandbox number `hi` — the bot replies and walks you through a
   submission. Send `restart` any time to start over.

### Going to production (your own number)
1. In Twilio, register a **WhatsApp Sender** (your business number) via the
   WhatsApp Business onboarding (needs a Meta Business account + display-name
   approval).
2. Point that sender's inbound webhook at the same `/api/whatsapp/webhook` URL.
3. Set `TWILIO_WHATSAPP_NUMBER` to your approved number.

### Notes / limits
- Sessions are in-memory per phone number (fine for a single instance / demo).
  For scale, swap the `sessions` Map in `api/_whatsapp.ts` for a Supabase table
  keyed by phone.
- Free-form replies work within WhatsApp's 24-hour customer-service window — the
  artist starts the chat, so the whole submission fits with no paid templates.
- Audio > ~16 MB won't attach on WhatsApp; the bot accepts a download link
  instead (SoundCloud / Drive / WeTransfer).

---

## 2. AI Split-Sheet (grounded royalty analysis)

On the **/splits** page, "AI Royalty Analysis" reads your contributor list and
generates a global royalty breakdown (SA: SAMRO/CAPASSO/SAMPRA · US:
ASCAP/BMI/SESAC/GMR, The MLC/HFA, SoundExchange · UK/EU: PRS/MCPS/PPL and more),
with **live-researched rules + cited sources** via Gemini + Google Search.

### Env var
```
GOOGLE_API_KEY=your_google_ai_studio_key          # from https://aistudio.google.com
GEMINI_SPLIT_MODEL=gemini-2.5-flash               # optional override
```
Without `GOOGLE_API_KEY` the button shows a friendly "add a key" message instead
of erroring.

---

## 3. DropKast MCP server

Lives in `../dropkast-mcp/`. See its `README.md` for Claude Desktop / Claude Code
registration. It exposes DropKast operations (releases, campaigns, analytics,
earnings, split-sheet, submissions) as MCP tools.
