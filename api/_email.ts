/**
 * Email notification service — wraps Resend for branded transactional emails.
 *
 * All functions are fire-and-forget: they never throw to the caller.
 * If Resend is not configured (no RESEND_API_KEY), every send silently
 * no-ops so the app still works in development / demo mode.
 */
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? 'notifications@dropkast.dev';
const TEAM = (process.env.EMAIL_TEAM ?? '').split(',').filter(Boolean);

function wrapHtml(body: string, accent = '#FF4D00'): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#111;border-radius:12px;overflow:hidden;border:1px solid #222;">
    <div style="background:linear-gradient(135deg,#1a1a1a 0%,#0d0d0d 100%);padding:28px 28px 16px;border-bottom:1px solid #222;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:36px;height:36px;background:${accent};border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <span style="color:#000;font-weight:800;font-size:14px;">K</span>
        </div>
        <div>
          <div style="color:${accent};font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;">DROPKAST</div>
          <div style="color:#fff;font-size:15px;font-weight:600;margin-top:2px;">Notification</div>
        </div>
      </div>
    </div>
    <div style="padding:24px 28px;">
      ${body}
    </div>
    <div style="padding:16px 28px;background:#0d0d0d;border-top:1px solid #1a1a1a;text-align:center;">
      <span style="color:#555;font-size:11px;">dropkast.lvrn.dev · AI-powered music distribution</span>
    </div>
  </div>
</body>
</html>`;
}

function section(title: string, rows: string): string {
  return `
    <tr><td colspan="2" style="padding:12px 0 4px;color:${accentFor(title)};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.15em;border-top:1px solid #2a2a2a;">${title}</td></tr>
    ${rows}`;
}

function accentFor(_section: string): string {
  return '#FF4D00';
}

function row(label: string, value?: string | null): string {
  if (!value) return '';
  return `
    <tr>
      <td style="padding:4px 8px;background:#1a1a1a;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;width:160px;">${label}</td>
      <td style="padding:4px 8px;color:#f0f0f0;font-size:12px;">${value}</td>
    </tr>`;
}

// ── Templates ──────────────────────────────────────────────────────────────

export function templateSignup(name: string, role: string): string {
  return wrapHtml(`
    <div style="padding:8px 0 16px;border-bottom:1px solid #1a1a1a;margin-bottom:16px;">
      <div style="color:#fff;font-size:18px;font-weight:700;">Welcome to DropKast, ${name}</div>
      <div style="color:#888;font-size:13px;margin-top:4px;">Your ${role.toLowerCase()} portal is ready.</div>
    </div>
    <div style="color:#ccc;font-size:13px;line-height:1.6;">
      <p>You now have access to AI-powered distribution, campaign tools, and the full creator network.</p>
      <p style="margin-top:12px;"><strong>Next steps:</strong></p>
      <ul style="color:#aaa;padding-left:20px;">
        <li>Upload your first release</li>
        <li>Set up your artist profile</li>
        <li>Explore the AI content studio</li>
      </ul>
    </div>
    <a href="https://dropkast.lvrn.dev/dashboard" style="display:inline-block;margin-top:20px;padding:12px 32px;background:${'#FF4D00'};color:#000;text-decoration:none;font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;border-radius:6px;">Go to Dashboard</a>
  `);
}

export function templateAnrSubmission(artistName: string, trackName: string, notes?: string): string {
  return wrapHtml(`
    <div style="padding:8px 0 16px;border-bottom:1px solid #1a1a1a;margin-bottom:16px;">
      <div style="color:#fff;font-size:18px;font-weight:700;">A&R Submission Received</div>
      <div style="color:#888;font-size:13px;margin-top:4px;">Your track is being reviewed.</div>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      ${section('Track Info', [
        row('Artist', artistName),
        row('Track', trackName),
        row('Notes', notes),
      ].join(''))}
    </table>
    <div style="color:#aaa;font-size:12px;line-height:1.6;margin-top:16px;padding:12px;background:#1a1a1a;border-left:3px solid ${'#FF4D00'};">
      The LVRN A&R team will review your submission and get back to you. You'll receive an email when the critique is ready.
    </div>
  `);
}

export function templateReleaseLive(artistName: string, releaseTitle: string, platforms: string[]): string {
  return wrapHtml(`
    <div style="padding:8px 0 16px;border-bottom:1px solid #1a1a1a;margin-bottom:16px;">
      <div style="color:#fff;font-size:18px;font-weight:700;">Release is Live!</div>
      <div style="color:#888;font-size:13px;margin-top:4px;">${releaseTitle} by ${artistName}</div>
    </div>
    <div style="color:#ccc;font-size:13px;line-height:1.6;">
      <p>Your release is now live on ${platforms.length} platform${platforms.length !== 1 ? 's' : ''}:</p>
      <ul style="color:#aaa;padding-left:20px;">
        ${platforms.map((p) => `<li>${p}</li>`).join('')}
      </ul>
    </div>
    <a href="https://dropkast.lvrn.dev/releases" style="display:inline-block;margin-top:20px;padding:12px 32px;background:${'#FF4D00'};color:#000;text-decoration:none;font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;border-radius:6px;">View Releases</a>
  `);
}

export function templateDjPackDelivered(djName: string, artistName: string, packTitle: string): string {
  return wrapHtml(`
    <div style="padding:8px 0 16px;border-bottom:1px solid #1a1a1a;margin-bottom:16px;">
      <div style="color:#fff;font-size:18px;font-weight:700;">DJ Pack Delivered</div>
      <div style="color:#888;font-size:13px;margin-top:4px;">${packTitle}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      ${section('Pack Info', [
        row('DJ', djName),
        row('Artist', artistName),
        row('Pack', packTitle),
      ].join(''))}
    </table>
    <div style="color:#aaa;font-size:12px;line-height:1.6;margin-top:16px;padding:12px;background:#1a1a1a;border-left:3px solid ${'#FF4D00'};">
      Head to your DJ portal to download stems, edits, and transmission assets.
    </div>
    <a href="https://dropkast.lvrn.dev/dj/packs" style="display:inline-block;margin-top:20px;padding:12px 32px;background:${'#FF4D00'};color:#000;text-decoration:none;font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;border-radius:6px;">Open DJ Portal</a>
  `);
}

export function templateMissionAccepted(creatorName: string, campaignName: string): string {
  return wrapHtml(`
    <div style="padding:8px 0 16px;border-bottom:1px solid #1a1a1a;margin-bottom:16px;">
      <div style="color:#fff;font-size:18px;font-weight:700;">Mission Confirmed</div>
      <div style="color:#888;font-size:13px;margin-top:4px;">You've accepted: ${campaignName}</div>
    </div>
    <div style="color:#ccc;font-size:13px;line-height:1.6;">
      <p>Thanks, ${creatorName}! The campaign organizer has been notified.</p>
      <p style="margin-top:12px;">You'll receive content briefs, deadlines, and asset links in your influencer portal.</p>
    </div>
    <a href="https://dropkast.lvrn.dev/influencer/missions" style="display:inline-block;margin-top:20px;padding:12px 32px;background:${'#FF4D00'};color:#000;text-decoration:none;font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;border-radius:6px;">View Missions</a>
  `);
}

// ── Send helpers ───────────────────────────────────────────────────────────

async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string[];
  replyTo?: string;
}): Promise<void> {
  if (!resend) {
    console.debug('[email] Resend not configured — skipping send to', opts.to);
    return;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
      ...(opts.cc?.length ? { cc: opts.cc } : {}),
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    });
    if (error) console.error('[email] send failed:', error);
  } catch (err) {
    console.error('[email] send threw:', err);
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

export function notifySignup(email: string, name: string, role: string): void {
  void sendEmail({
    to: email,
    subject: `Welcome to DropKast, ${name}!`,
    html: templateSignup(name, role),
  });
  if (TEAM.length) {
    void sendEmail({
      to: TEAM,
      subject: `New DropKast user: ${name} (${role})`,
      html: wrapHtml(`<p style="color:#ccc;font-size:13px;">New user signed up:</p><table>${section('User', [row('Name', name), row('Role', role), row('Email', email)].join(''))}</table>`),
    });
  }
}

export function notifyAnrSubmission(email: string, artistName: string, trackName: string, notes?: string): void {
  void sendEmail({
    to: email,
    subject: `A&R Submission Received — ${artistName}`,
    html: templateAnrSubmission(artistName, trackName, notes),
    replyTo: 'ar@lvrn.com',
  });
}

export function notifyReleaseLive(email: string, artistName: string, releaseTitle: string, platforms: string[]): void {
  void sendEmail({
    to: email,
    subject: `🎵 ${releaseTitle} is live!`,
    html: templateReleaseLive(artistName, releaseTitle, platforms),
  });
}

export function notifyDjPackDelivered(djEmail: string, djName: string, artistName: string, packTitle: string): void {
  void sendEmail({
    to: djEmail,
    subject: `DJ Pack: ${packTitle} from ${artistName}`,
    html: templateDjPackDelivered(djName, artistName, packTitle),
  });
}

export function notifyMissionAccepted(creatorEmail: string, creatorName: string, campaignName: string): void {
  void sendEmail({
    to: creatorEmail,
    subject: `Mission Accepted: ${campaignName}`,
    html: templateMissionAccepted(creatorName, campaignName),
  });
}
