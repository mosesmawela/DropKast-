import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-primary text-[11px] font-black tracking-[0.3em] uppercase italic mb-12 transition-colors"
        >
          <ChevronLeft className="w-3 h-3" /> Back home
        </Link>

        <header className="mb-12 border-b border-white/10 pb-8">
          <div className="text-[10px] font-black text-primary tracking-[0.3em] uppercase italic mb-3">DropKast</div>
          <h1 className="text-5xl md:text-6xl font-black italic leading-none mb-4">Privacy Policy</h1>
          <p className="text-white/40 text-sm italic">Last updated: April 29, 2026</p>
        </header>

        <div className="space-y-10 text-white/70 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-2xl font-black italic text-white mb-4">1. What we collect</h2>
            <p>
              When you sign up we collect your email, artist name, country, and a hashed password. When you upload music we
              collect the audio file, cover art, ISRC/UPC codes (if you provide them), and metadata like title, genre, and
              release date. When you connect a payout account we collect what Stripe needs to verify you for tax reporting.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black italic text-white mb-4">2. What we do with it</h2>
            <p>
              We use your data to deliver your music to streaming services, pay you when it earns money, run AI-assisted
              marketing on your behalf if you ask us to, and answer your questions when you contact support. We do not sell
              your personal data. We do not train AI models on your music or lyrics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black italic text-white mb-4">3. Who we share it with</h2>
            <p>
              We share what's necessary with the streaming platforms you choose to deliver to (Spotify, Apple Music, etc.),
              with Stripe to process payouts, and with our AI providers (Anthropic / Groq / NVIDIA / etc.) when you use the
              chat assistant — only the messages you send, never your full account. That's it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black italic text-white mb-4">4. Your rights</h2>
            <p>
              You can export every byte we hold about you with one click on the Compliance page (uses{' '}
              <code className="text-primary">GET /api/me/export</code>). You can delete your account the same way. If you're
              in the EU/UK, GDPR Articles 15–22 apply automatically. If you're in California, CCPA applies. We honour both.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black italic text-white mb-4">5. Cookies</h2>
            <p>
              We use one session cookie to keep you logged in and Vercel Analytics for aggregate page-view counts (no
              personal identifiers). No advertising cookies. No third-party trackers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black italic text-white mb-4">6. Contact</h2>
            <p>
              Privacy questions: <a href="mailto:moses@lvrn.com" className="text-primary hover:underline">moses@lvrn.com</a>.
              We respond within 5 business days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
