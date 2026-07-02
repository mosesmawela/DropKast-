/**
 * Royalty Advances — opt-in cash advance against forward earnings.
 *
 * Mirrors Amuse's Advances UX: the artist sees an auto-calculated offer
 * card. Single tap to accept. Funds release in 1–3 business days when
 * Stripe Connect is wired (today: simulator records the accept locally).
 *
 * No catalogue rights are taken. Strict recoupment from forward royalty
 * statements — once recouped, the artist's full share resumes.
 */
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  Sparkles,
  TrendingUp,
  Check,
  Calendar,
  Info,
  ShieldCheck,
  ArrowRight,
  Clock,
  X as XIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { UpgradeBanner, useTierGate } from '../components/UpgradePrompt';
import { cn } from '../lib/utils';
import {
  offerFromLedger,
  recordAccept,
  listAccepted,
  type AdvanceOffer,
  type AcceptedAdvance,
  type AdvanceLineSummary,
} from '../lib/advances';

function loadLedger(): AdvanceLineSummary[] {
  try {
    const cached = localStorage.getItem('dropkast.advances.ledger.cache');
    if (cached) return JSON.parse(cached);
  } catch {/* ignore */}
  return [];
}

const fmtCents = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function Advances() {
  const [ledger] = useState(() => loadLedger());
  const [offer, setOffer] = useState<AdvanceOffer | null>(null);
  const [accepted, setAccepted] = useState<AcceptedAdvance[]>(() => listAccepted());
  const [confirming, setConfirming] = useState(false);
  const gate = useTierGate();
  const advancesUnlocked = gate.has('advances');

  useEffect(() => {
    setOffer(offerFromLedger(ledger));
  }, [ledger]);

  const handleAccept = () => {
    if (!offer || !offer.eligible) return;
    if (!advancesUnlocked) {
      toast.error('Advances are an Indie+ feature', { description: 'Upgrade to accept this offer.' });
      return;
    }
    const adv = recordAccept(offer);
    setAccepted([adv, ...accepted]);
    setConfirming(false);
    toast.success(`${fmtCents(offer.offerCents)} advance accepted`, {
      description: 'Funds release within 3 business days. Recoupment starts on your next royalty statement.',
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4 min-w-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic">
            <Wallet className="w-3 h-3 shrink-0" /> Royalty Advances
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none break-words">
            Cash up <span className="text-primary">front</span>
          </h1>
          {!advancesUnlocked && (
            <UpgradeBanner
              feature="Royalty Advances"
              requiredTier="indie"
              description="Advances are bundled into Indie tier and above. Recoup from forward statements, keep your masters."
              className="mt-3"
            />
          )}
          <p className="text-white/40 text-base font-medium leading-relaxed max-w-2xl">
            Get paid future royalties today. We auto-calculate an offer based on your earnings —
            no application, no rights handover, no minimum credit score. Recoup from forward
            statements until paid back, then your full share resumes.
          </p>
        </div>

        <div className="manifest-card p-6 bg-dark border-primary/20 w-full md:w-auto md:min-w-[260px] shrink-0">
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-2">
            Trailing 6-mo
          </div>
          <div className="text-4xl font-black italic text-white mb-1">
            {fmtCents(offer?.trailingMonthlyCents ?? 0)}
          </div>
          <div className="text-[10px] text-white/40 italic">average per month</div>
        </div>
      </div>

      {/* Offer */}
      {offer?.eligible ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="manifest-card p-5 sm:p-10 bg-gradient-to-br from-primary/15 via-dark to-dark border border-primary/30 relative overflow-hidden mb-8"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">
                  Your offer
                </span>
              </div>
              <div>
                <div className="text-[12px] text-white/40 italic mb-2">You're approved for</div>
                <div className="text-5xl sm:text-7xl md:text-8xl font-black italic text-white tracking-tighter leading-none">
                  {fmtCents(offer.offerCents)}
                </div>
                <div className="text-[12px] text-white/50 italic mt-3">
                  ≈ {offer.multipleOfTrailingMonthly} months of trailing earnings · funds release within 3 business days
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div>
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-widest italic mb-1">
                    Recoupment
                  </div>
                  <div className="text-2xl font-black italic text-white">
                    {offer.recoupmentPct}%
                  </div>
                  <div className="text-[10px] text-white/30 italic">of incoming royalty</div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-widest italic mb-1">
                    Est. payback
                  </div>
                  <div className="text-2xl font-black italic text-white">
                    ~{offer.estMonthsToRecoup} mo
                  </div>
                  <div className="text-[10px] text-white/30 italic">at current rate</div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-widest italic mb-1">
                    Fee
                  </div>
                  <div className="text-2xl font-black italic text-white">0%</div>
                  <div className="text-[10px] text-white/30 italic">no interest, no APR</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setConfirming(true)}
                className="beam w-full h-16 bg-white text-black text-[12px] font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-3"
              >
                Accept advance <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-white/40 italic leading-relaxed">
                Tap to accept. Funds release after Stripe verification (typically 1-3 business
                days). Cancel anytime before disbursement.
              </p>
              <div className="border border-white/10 p-4 space-y-2">
                <div className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">
                  Why this offer
                </div>
                <ul className="space-y-1.5">
                  {offer.reasons.map((r, i) => (
                    <li key={i} className="text-[11px] text-white/60 italic flex items-start gap-2">
                      <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="manifest-card p-5 sm:p-10 bg-dark border border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-white/40" />
            <h3 className="text-xl font-black italic text-white">Not eligible yet</h3>
          </div>
          <p className="text-white/50 italic mb-6">{offer?.reason}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border border-white/5 p-4">
              <div className="text-[9px] font-black text-white/40 uppercase tracking-widest italic mb-1">
                Step 1
              </div>
              <div className="text-sm font-black italic text-white mb-1">Release music</div>
              <div className="text-[11px] text-white/50 italic">
                You need at least 3 months of royalty data.
              </div>
            </div>
            <div className="border border-white/5 p-4">
              <div className="text-[9px] font-black text-white/40 uppercase tracking-widest italic mb-1">
                Step 2
              </div>
              <div className="text-sm font-black italic text-white mb-1">Earn $50+/mo</div>
              <div className="text-[11px] text-white/50 italic">
                Trailing average needs to clear $50/month.
              </div>
            </div>
            <div className="border border-white/5 p-4">
              <div className="text-[9px] font-black text-white/40 uppercase tracking-widest italic mb-1">
                Step 3
              </div>
              <div className="text-sm font-black italic text-white mb-1">We auto-offer</div>
              <div className="text-[11px] text-white/50 italic">
                Once you qualify, an offer appears here. No application.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accepted advances */}
      {accepted.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.3em] italic mb-4">
            Active advances
          </h3>
          <div className="space-y-3">
            {accepted.map((a) => {
              const recoupedPct = a.offerCents > 0 ? Math.min((a.recoupedCents / a.offerCents) * 100, 100) : 0;
              return (
                <div key={a.id} className="manifest-card p-6 bg-dark border border-white/5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4">
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest italic mb-1">
                      Accepted {new Date(a.acceptedAt).toLocaleDateString()}
                    </div>
                    <div className="text-3xl font-black italic text-white">{fmtCents(a.offerCents)}</div>
                  </div>
                  <div className="md:col-span-5">
                    <div className="flex items-center justify-between mb-2 text-[10px] font-black text-white/40 uppercase tracking-widest italic">
                      <span>Recouped</span>
                      <span>{Math.round(recoupedPct)}%</span>
                    </div>
                    <div className="h-2 bg-white/5 relative overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-primary transition-all"
                        style={{ width: `${recoupedPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-3 text-right">
                    <span
                      className={cn(
                        'inline-flex items-center gap-2 px-3 py-1.5 border text-[9px] font-black uppercase tracking-widest italic',
                        a.status === 'paid-off'
                          ? 'border-green-500/40 text-green-300 bg-green-500/5'
                          : a.status === 'recouping'
                          ? 'border-primary/40 text-primary bg-primary/5'
                          : 'border-yellow-500/40 text-yellow-300 bg-yellow-500/5',
                      )}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      {a.status === 'paid-off'
                        ? 'Paid off'
                        : a.status === 'recouping'
                        ? 'Recouping'
                        : 'Pending payout'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="manifest-card p-6 bg-dark border border-white/5">
          <TrendingUp className="w-5 h-5 text-primary mb-3" />
          <h4 className="text-sm font-black italic text-white mb-2">No interest. No APR.</h4>
          <p className="text-[11px] text-white/50 italic leading-relaxed">
            We take a flat % of incoming royalties until the advance is recouped. That's it. Once
            it's paid off, you go straight back to 100%.
          </p>
        </div>
        <div className="manifest-card p-6 bg-dark border border-white/5">
          <ShieldCheck className="w-5 h-5 text-primary mb-3" />
          <h4 className="text-sm font-black italic text-white mb-2">You keep your masters.</h4>
          <p className="text-[11px] text-white/50 italic leading-relaxed">
            We never take ownership. Your catalogue is yours. The advance is recouped from forward
            royalty statements, period.
          </p>
        </div>
        <div className="manifest-card p-6 bg-dark border border-white/5">
          <Calendar className="w-5 h-5 text-primary mb-3" />
          <h4 className="text-sm font-black italic text-white mb-2">Fast disbursement.</h4>
          <p className="text-[11px] text-white/50 italic leading-relaxed">
            1–3 business days to your connected payout account once accepted. Stripe handles the
            verification.
          </p>
        </div>
      </div>

      {/* Confirm modal */}
      {confirming && offer && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setConfirming(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="manifest-card p-8 bg-dark border-primary/30 max-w-lg w-full space-y-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-black italic text-white tracking-tight mb-2">
                  Accept advance
                </h2>
                <p className="text-sm text-white/50 italic">
                  You'll receive <span className="text-white font-black">{fmtCents(offer.offerCents)}</span>
                  . We'll recoup {offer.recoupmentPct}% of incoming royalties for ~{offer.estMonthsToRecoup} months.
                </p>
              </div>
              <button
                onClick={() => setConfirming(false)}
                aria-label="Close"
                className="text-white/40"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-white/10 p-4 space-y-3 text-[12px] text-white/60 italic">
              <div className="flex items-start gap-2">
                <Info className="w-3 h-3 shrink-0 mt-0.5 text-primary" />
                <span>You keep your catalogue. We never take ownership.</span>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-3 h-3 shrink-0 mt-0.5 text-primary" />
                <span>Once recouped, your full royalty share resumes immediately.</span>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-3 h-3 shrink-0 mt-0.5 text-primary" />
                <span>0% interest. 0% APR. Flat recoupment from forward earnings only.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="beam h-12 px-6 border border-white/10 text-white/60 text-[10px] font-black uppercase italic tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                className="beam flex-1 h-12 bg-white text-black text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-3"
              >
                Confirm — accept {fmtCents(offer.offerCents)}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
