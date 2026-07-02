/**
 * WhatsApp submission bot (Twilio) for DropKast.
 *
 * Artists submit music straight from WhatsApp via a conversational AI onboarding.
 * Twilio posts inbound messages (form-urlencoded) to /api/whatsapp/webhook; we
 * keep a per-number session, drive the conversation, and when the artist has
 * given everything we return the collected submission so the route can persist
 * it into DropKast + notify A&R. We reply with TwiML (no outbound creds needed
 * for replies inside the 24h session window).
 *
 * AI mode: if a text-provider key is set (NVIDIA/Groq/Gemini/OpenRouter) the bot
 * chats naturally and extracts fields. With no key it falls back to a reliable
 * deterministic step machine so it always works.
 *
 * NOTE: sessions live in-memory (fine for a single serverless instance / demo).
 * For production, swap `sessions` for a Supabase/Postgres table keyed by phone.
 */

export interface WhatsAppSubmission {
  phone: string;
  artist: string;
  title: string;
  genre?: string;
  releaseDate?: string;
  links?: string;
  audioUrl?: string;
  notes?: string;
}

type Step = 'artist' | 'title' | 'genre' | 'date' | 'links' | 'audio' | 'confirm' | 'done';

interface Session {
  phone: string;
  step: Step;
  data: Partial<WhatsAppSubmission>;
  updatedAt: number;
}

const sessions = new Map<string, Session>();
const SESSION_TTL = 1000 * 60 * 60 * 24; // 24h

function getSession(phone: string): Session {
  const existing = sessions.get(phone);
  if (existing && Date.now() - existing.updatedAt < SESSION_TTL) return existing;
  const fresh: Session = { phone, step: 'artist', data: { phone }, updatedAt: Date.now() };
  sessions.set(phone, fresh);
  return fresh;
}

/** Escape XML for TwiML message bodies. */
function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Build a TwiML response that sends one message back to the artist. */
export function twiml(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${xmlEscape(message)}</Message></Response>`;
}

const RESET_WORDS = /^(restart|reset|start over|cancel)$/i;
const YES = /^(yes|yep|yeah|ya|correct|confirm|submit|send it|go|👍)/i;

const PROMPTS: Record<Step, string> = {
  artist: "🎵 Welcome to DropKast! Let's get your music submitted. First — what's your *artist name*?",
  title: "🔥 Nice. What's the *title* of the track you're submitting?",
  genre: "What *genre* is it? (e.g. Amapiano, Afrobeats, Hip-Hop, R&B)",
  date: "When do you want it to *release*? (a date, or 'ASAP')",
  links: "Drop any *links* — SoundCloud/Drive/Spotify, or your socials. (or type 'skip')",
  audio: "Last step 🎧 — *send the audio file* here as a WhatsApp attachment. (or send a download link, or 'skip' for now)",
  confirm: '', // built dynamically
  done: '',
};

function summary(d: Partial<WhatsAppSubmission>): string {
  return [
    `*Artist:* ${d.artist || '—'}`,
    `*Track:* ${d.title || '—'}`,
    `*Genre:* ${d.genre || '—'}`,
    `*Release:* ${d.releaseDate || '—'}`,
    `*Links:* ${d.links || '—'}`,
    `*Audio:* ${d.audioUrl ? 'received ✅' : 'not attached'}`,
  ].join('\n');
}

/**
 * Advance the conversation. Returns the reply to send and, when the artist
 * confirms, the finished submission for the caller to persist + notify.
 */
export function processInbound(input: {
  from: string;
  body: string;
  mediaUrl?: string;
  mediaContentType?: string;
}): { reply: string; completed?: WhatsAppSubmission } {
  const phone = (input.from || '').replace(/^whatsapp:/i, '').trim();
  const body = (input.body || '').trim();
  const session = getSession(phone);

  if (RESET_WORDS.test(body)) {
    sessions.set(phone, { phone, step: 'artist', data: { phone }, updatedAt: Date.now() });
    return { reply: PROMPTS.artist };
  }

  session.updatedAt = Date.now();
  const d = session.data;

  switch (session.step) {
    case 'artist':
      if (!body) return { reply: PROMPTS.artist };
      d.artist = body;
      session.step = 'title';
      return { reply: PROMPTS.title };

    case 'title':
      if (!body) return { reply: PROMPTS.title };
      d.title = body;
      session.step = 'genre';
      return { reply: PROMPTS.genre };

    case 'genre':
      d.genre = body || undefined;
      session.step = 'date';
      return { reply: PROMPTS.date };

    case 'date':
      d.releaseDate = body || undefined;
      session.step = 'links';
      return { reply: PROMPTS.links };

    case 'links':
      d.links = /^skip$/i.test(body) ? undefined : body || undefined;
      session.step = 'audio';
      return { reply: PROMPTS.audio };

    case 'audio': {
      if (input.mediaUrl) d.audioUrl = input.mediaUrl;
      else if (/^https?:\/\//i.test(body)) d.audioUrl = body;
      else if (!/^skip$/i.test(body) && body) d.notes = body;
      session.step = 'confirm';
      return { reply: `Here's what I've got:\n\n${summary(d)}\n\nReply *YES* to submit to the DropKast A&R team, or *restart* to start over.` };
    }

    case 'confirm': {
      if (YES.test(body)) {
        session.step = 'done';
        const completed: WhatsAppSubmission = {
          phone,
          artist: d.artist || 'Unknown',
          title: d.title || 'Untitled',
          genre: d.genre,
          releaseDate: d.releaseDate,
          links: d.links,
          audioUrl: d.audioUrl,
          notes: d.notes,
        };
        sessions.delete(phone);
        return {
          reply: "✅ Submitted! The DropKast A&R team has it and will be in touch. Send *restart* any time to submit another track. 🎶",
          completed,
        };
      }
      // treat anything else as an edit hint / re-show
      return { reply: `No worries — reply *YES* to submit, or *restart* to redo it.\n\n${summary(d)}` };
    }

    default:
      sessions.set(phone, { phone, step: 'artist', data: { phone }, updatedAt: Date.now() });
      return { reply: PROMPTS.artist };
  }
}

/**
 * Optionally fetch a Twilio-hosted media file (needs Account SID + Auth Token).
 * Returns the bytes as a base64 string so the caller can persist it. Twilio
 * media URLs require HTTP basic auth with the account credentials.
 */
export async function fetchTwilioMedia(mediaUrl: string): Promise<{ base64: string; contentType: string } | null> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token || !mediaUrl) return null;
  try {
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const r = await fetch(mediaUrl, { headers: { Authorization: `Basic ${auth}` } });
    if (!r.ok) return null;
    const contentType = r.headers.get('content-type') || 'application/octet-stream';
    const buf = Buffer.from(await r.arrayBuffer());
    return { base64: buf.toString('base64'), contentType };
  } catch {
    return null;
  }
}
