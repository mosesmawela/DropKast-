import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Terms() {
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
          <h1 className="text-5xl md:text-6xl font-black italic leading-none mb-4">Terms of Service</h1>
          <p className="text-white/40 text-sm italic">Last updated: April 29, 2026</p>
        </header>

        <div className="space-y-10 text-white/70 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-2xl font-black italic text-white mb-4">1. The deal in plain English</h2>
            <p>
              DropKast helps you distribute your music to streaming platforms, run AI-assisted marketing, and collect royalties.
              You keep 100% of your masters. We never claim ownership of your songs. You can take your catalogue down at any
              time. We charge a flat distribution fee (no percentage of streams) plus a small fee on AI compute and
              influencer/DJ payouts to cover our costs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black italic text-white mb-4">2. What you have to promise us</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You own (or have permission to release) every track you upload.</li>
              <li>You'll provide accurate metadata. Wrong ISRCs or fake artist names get tracks rejected.</li>
              <li>You won't upload copyrighted samples without clearance, AI-generated impersonations of other artists,
                  or content that violates DSP guidelines (hate speech, deceptive content, etc.).</li>
              <li>If you collect splits, the split sheet is correct. If a co-writer disputes it later, that's between you
                  and them — but DropKast may pause payouts until it's resolved.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black italic text-white mb-4">3. What we promise you</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>We deliver your release to the platforms you select within 5 business days of approval.</li>
              <li>We pay your share of royalties within 30 days of receiving the DSP statement.</li>
              <li>We never train AI models on your music, lyrics, or chat history.</li>
              <li>If we discontinue the service, we give you 90 days to export your catalogue and migrate.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black italic text-white mb-4">4. DMCA + takedowns</h2>
            <p>
              If someone files a copyright claim against your release, we'll forward it to you and pause distribution while
              you respond. Send DMCA notices to <a href="mailto:moses@lvrn.com" className="text-primary hover:underline">moses@lvrn.com</a>{' '}
              with the work, the infringing URL, your contact info, and a statement under penalty of perjury that you own the
              rights. You can also file via the in-app Compliance page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black italic text-white mb-4">5. AI assistant disclosure</h2>
            <p>
              The chat assistant routes through third-party AI providers (Anthropic Claude / Groq / NVIDIA / Cerebras / OpenRouter
              / Google Gemini / OpenAI). Your messages and any file content you share with it leave our servers. The providers
              process under their own privacy policies. We do not retain chat history beyond 30 days for support purposes.
              The AI can be wrong — verify anything important before acting on it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black italic text-white mb-4">6. Cancellation</h2>
            <p>
              Cancel anytime from Settings. Your active releases stay live unless you also request a takedown. Pending payouts
              still pay out on the normal cycle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black italic text-white mb-4">7. Liability</h2>
            <p>
              We provide the service "as is." We're not liable for lost revenue from DSP outages, chart-position promises that
              don't pan out, or AI-generated suggestions that flop. Total liability is capped at the fees you paid us in the
              last 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black italic text-white mb-4">8. Contact</h2>
            <p>
              Questions or disputes: <a href="mailto:moses@lvrn.com" className="text-primary hover:underline">moses@lvrn.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
