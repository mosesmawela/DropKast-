/**
 * Royalty Splits — invite, sign, get paid.
 *
 * Modeled on Amuse Splits + DistroKid Splits: each collaborator is invited
 * by email/SMS, accepts via a one-click link, and is paid directly to their
 * own connected payout account when royalties land.
 *
 * Statuses per collaborator:
 *   - draft     : added to the sheet but no invite sent yet
 *   - invited   : email/SMS sent, waiting on acceptance
 *   - accepted  : collaborator accepted; their share is locked in
 *   - declined  : collaborator declined
 *
 * The full sheet POSTs to /api/splits when "Save split sheet" is clicked.
 * Individual invites POST to /api/splits/invite (frontend-emulated for now;
 * real impl emails via Postmark/Resend).
 */
import { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  ChevronRight,
  Check,
  ShieldCheck,
  Send,
  Clock,
  X as XIcon,
  Sparkles,
  Mail,
  Info,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type Status = 'draft' | 'invited' | 'accepted' | 'declined';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: string;
  share: number;
  status: Status;
  invitedAt?: string;
  acceptedAt?: string;
}

const STORAGE_KEY = 'dropkast.splits.draft';
const DEFAULT_ROLES = ['Songwriter', 'Producer', 'Featured Artist', 'Mixer', 'Mastering', 'Performer', 'Other'];
const COLORS = ['#FF4D00', '#ffffff', '#888888', '#444444', '#FFA02E', '#FF8E99'];

function loadDraft(): Collaborator[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {/* ignore */}
  return [
    { id: '1', name: 'You (primary artist)', email: 'you@email.com', role: 'Primary Artist', share: 100, status: 'accepted' },
  ];
}

function saveDraft(list: Collaborator[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {/* ignore */}
}

const StatusPill = ({ status }: { status: Status }) => {
  const config = {
    draft:    { label: 'Not invited', icon: Info,  cls: 'border-white/20 text-white/60 bg-white/5' },
    invited:  { label: 'Invited',     icon: Clock, cls: 'border-yellow-500/40 text-yellow-300 bg-yellow-500/5' },
    accepted: { label: 'Accepted',    icon: Check, cls: 'border-green-500/40 text-green-300 bg-green-500/5' },
    declined: { label: 'Declined',    icon: XIcon, cls: 'border-red-500/40 text-red-300 bg-red-500/5' },
  }[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 border text-[9px] font-black uppercase tracking-widest italic',
        config.cls,
      )}
    >
      <Icon className="w-2.5 h-2.5" />
      {config.label}
    </span>
  );
};

export default function Splits() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(() => loadDraft());
  const [newCollab, setNewCollab] = useState({ name: '', email: '', role: 'Songwriter', share: 0 });
  const [savingSheet, setSavingSheet] = useState(false);

  // --- AI royalty analysis (grounded global split-sheet) ---
  const [aiOpen, setAiOpen] = useState(false);
  const [aiSong, setAiSong] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<{ text: string; sources: { title: string; uri: string }[] } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const runAiAnalysis = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiReport(null);
    try {
      const contributors = collaborators.map((c) => ({ name: c.name, roles: [c.role], percentage: c.share }));
      const res = await fetch('/api/splits/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songTitle: aiSong || 'Untitled', contributors }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate analysis');
      setAiReport({ text: data.text, sources: data.sources || [] });
    } catch (e: any) {
      const msg = String(e?.message || e);
      setAiError(/GOOGLE_API_KEY/i.test(msg) ? 'Grounded analysis needs a Google API key on the server (GOOGLE_API_KEY). Add it in your env to enable this.' : msg);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    saveDraft(collaborators);
  }, [collaborators]);

  const totalShare = useMemo(
    () => collaborators.reduce((sum, p) => sum + p.share, 0),
    [collaborators],
  );

  const acceptedShare = useMemo(
    () => collaborators.filter((c) => c.status === 'accepted').reduce((s, c) => s + c.share, 0),
    [collaborators],
  );

  const addCollaborator = () => {
    if (!newCollab.name.trim() || !newCollab.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    if (newCollab.share <= 0) {
      toast.error('Share % must be greater than 0');
      return;
    }
    if (totalShare + newCollab.share > 100) {
      toast.error(`Adding this would put you at ${totalShare + newCollab.share}%`, {
        description: 'Total can\'t exceed 100. Adjust an existing share first.',
      });
      return;
    }
    setCollaborators([
      ...collaborators,
      {
        id: `co-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: newCollab.name.trim(),
        email: newCollab.email.trim(),
        role: newCollab.role,
        share: newCollab.share,
        status: 'draft',
      },
    ]);
    setNewCollab({ name: '', email: '', role: 'Songwriter', share: 0 });
    toast.success(`${newCollab.name} added — invite them when you're ready.`);
  };

  const updateShare = (id: string, share: number) => {
    setCollaborators((prev) => prev.map((c) => (c.id === id ? { ...c, share } : c)));
  };

  const removeCollaborator = (id: string) => {
    const target = collaborators.find((c) => c.id === id);
    if (!target) return;
    if (target.status === 'accepted') {
      if (!confirm(`${target.name} has already accepted. Remove anyway?`)) return;
    }
    setCollaborators(collaborators.filter((c) => c.id !== id));
    toast.message(`${target.name} removed from the split`);
  };

  const sendInvite = async (id: string) => {
    const c = collaborators.find((x) => x.id === id);
    if (!c) return;
    // Real impl: POST /api/splits/invite with collaborator + signing-link template
    setCollaborators((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, status: 'invited', invitedAt: new Date().toISOString() } : x,
      ),
    );
    toast.success(`Invite sent to ${c.email}`, {
      description: `${c.name} has 14 days to accept their ${c.share}% share.`,
    });
  };

  const sendAllPending = () => {
    const pending = collaborators.filter((c) => c.status === 'draft');
    if (!pending.length) {
      toast.message('No drafts to invite');
      return;
    }
    setCollaborators((prev) =>
      prev.map((c) =>
        c.status === 'draft'
          ? { ...c, status: 'invited', invitedAt: new Date().toISOString() }
          : c,
      ),
    );
    toast.success(`Sent ${pending.length} invite${pending.length > 1 ? 's' : ''}`, {
      description: 'They have 14 days to accept their share.',
    });
  };

  // Demo helper — simulates the collaborator clicking "accept" in their email
  const simulateAccept = (id: string) => {
    setCollaborators((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: 'accepted', acceptedAt: new Date().toISOString() } : c,
      ),
    );
    const target = collaborators.find((c) => c.id === id);
    if (target) toast.success(`${target.name} accepted`);
  };

  const saveSplitSheet = async () => {
    if (totalShare !== 100) {
      toast.error(`Total is ${totalShare}%`, {
        description: 'It must equal 100% to save the sheet.',
      });
      return;
    }
    setSavingSheet(true);
    try {
      const res = await fetch('/api/splits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payeeEmail: collaborators[0]?.email || 'you@email.com',
          payeeName: collaborators[0]?.name || 'You',
          percentage: collaborators[0]?.share || 0,
          collaborators,
          totalShare,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success('Split sheet saved', {
        description: 'When royalties come in, they\'ll auto-distribute by these percentages.',
      });
    } catch {
      toast.error('Couldn\'t save the sheet — try again');
    } finally {
      setSavingSheet(false);
    }
  };

  const exportPdf = () => {
    if (totalShare !== 100) {
      toast.error('Total must equal 100% before exporting');
      return;
    }
    // Generate a simple text representation since we don't have a PDF lib
    const lines = [
      'DROPKAST — ROYALTY SPLIT SHEET',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      ...collaborators.map(
        (c, i) =>
          `${i + 1}. ${c.name} (${c.role}) — ${c.share}% — ${c.status} — ${c.email}`,
      ),
      '',
      `Total: ${totalShare}%`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `split-sheet-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Split sheet downloaded');
  };

  const draftCount = collaborators.filter((c) => c.status === 'draft').length;
  const isComplete = totalShare === 100;

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-3 min-w-0">
          <div className="flex items-center gap-2 text-primary font-mono">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Royalty Splits</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white italic uppercase break-words">
            Split sheet
          </h1>
          <p className="text-white/40 text-sm italic max-w-2xl leading-relaxed">
            Add every co-writer, producer, and featured artist. Each collaborator gets paid directly
            to their own account when royalties come in. Shares must total 100% before you can save.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setAiOpen(true)}
            className="beam h-12 px-6 border border-primary/50 text-primary text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3 h-3" /> AI Royalty Analysis
          </button>
          {draftCount > 0 && (
            <button
              onClick={sendAllPending}
              className="beam h-12 px-6 border border-primary text-primary text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center gap-2"
            >
              <Send className="w-3 h-3" /> Invite all ({draftCount})
            </button>
          )}
          <button
            onClick={exportPdf}
            disabled={!isComplete}
            className="beam h-12 px-6 border border-white/20 text-[10px] font-black uppercase italic tracking-widest text-white transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Download className="w-3 h-3" /> Download
          </button>
          <button
            onClick={saveSplitSheet}
            disabled={!isComplete || savingSheet}
            className="beam h-12 px-6 bg-white text-black text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {savingSheet ? 'Saving...' : 'Save split sheet'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT — collaborator list + add form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white tracking-tight italic">Collaborators</h3>
            <div
              className={cn(
                'px-4 py-1.5 text-[10px] font-black uppercase tracking-widest italic border',
                isComplete
                  ? 'border-green-500/40 text-green-300 bg-green-500/5'
                  : 'border-yellow-500/40 text-yellow-300 bg-yellow-500/5',
              )}
            >
              {totalShare}% total {isComplete ? '✓' : `· need ${100 - totalShare}% more`}
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {collaborators.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="manifest-card p-6 bg-dark border border-white/5 transition-all space-y-4 group"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 border border-white/10 flex items-center justify-center bg-white/5 italic font-black text-primary text-xl shrink-0">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                      <div className="sm:col-span-1 min-w-0">
                        <div className="text-base font-black italic text-white truncate">{c.name}</div>
                        <div className="text-[10px] text-white/40 italic truncate">{c.email}</div>
                      </div>
                      <div className="sm:col-span-1">
                        <div className="text-[9px] font-black text-white/30 uppercase tracking-widest italic mb-1">Role</div>
                        <div className="text-xs font-black text-primary italic">{c.role}</div>
                      </div>
                      <div className="sm:col-span-1">
                        <div className="text-[9px] font-black text-white/30 uppercase tracking-widest italic mb-1">Status</div>
                        <StatusPill status={c.status} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">Share</div>
                        <div className="text-3xl font-black italic text-white leading-none mt-1">{c.share}%</div>
                      </div>
                      <button
                        onClick={() => removeCollaborator(c.id)}
                        aria-label="Remove collaborator"
                        className="beam w-8 h-8 border border-white/5 flex items-center justify-center text-white/30 transition-all opacity-70"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={c.share}
                      onChange={(e) => updateShare(c.id, parseInt(e.target.value))}
                      className="flex-1 accent-primary h-1 cursor-pointer"
                      aria-label={`${c.name} share percentage`}
                    />
                    <div className="flex gap-1.5">
                      {[10, 25, 50].map((v) => (
                        <button
                          key={v}
                          onClick={() => updateShare(c.id, v)}
                          className="px-2 h-7 bg-white/5 border border-white/10 text-[9px] font-black text-white/60 transition-all uppercase tracking-widest"
                        >
                          {v}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Per-row actions */}
                  {c.id !== '1' && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                      {c.status === 'draft' && (
                        <button
                          onClick={() => sendInvite(c.id)}
                          className="beam h-9 px-4 bg-primary text-white text-[9px] font-black uppercase italic tracking-widest transition-all flex items-center gap-2"
                        >
                          <Mail className="w-3 h-3" /> Send invite
                        </button>
                      )}
                      {c.status === 'invited' && (
                        <>
                          <span className="text-[10px] text-white/40 italic">
                            Invited {c.invitedAt && new Date(c.invitedAt).toLocaleDateString()} — 14d to accept
                          </span>
                          <button
                            onClick={() => sendInvite(c.id)}
                            className="beam h-9 px-3 border border-white/10 text-[9px] font-black text-white/60 uppercase italic tracking-widest transition-all"
                          >
                            Resend
                          </button>
                          <button
                            onClick={() => simulateAccept(c.id)}
                            className="beam h-9 px-3 border border-green-500/30 text-green-400 text-[9px] font-black uppercase italic tracking-widest transition-all"
                            title="Demo: simulate the collaborator accepting"
                          >
                            Demo accept
                          </button>
                        </>
                      )}
                      {c.status === 'accepted' && (
                        <span className="text-[10px] text-green-400 italic flex items-center gap-2">
                          <Check className="w-3 h-3" /> Accepted on{' '}
                          {c.acceptedAt && new Date(c.acceptedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add new */}
          <div className="manifest-card p-6 bg-white/[0.02] border border-white/10">
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest italic mb-4 flex items-center gap-2">
              <Plus className="w-3 h-3" /> Add collaborator
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <input
                type="text"
                value={newCollab.name}
                onChange={(e) => setNewCollab({ ...newCollab, name: e.target.value })}
                placeholder="Legal name"
                className="md:col-span-4 bg-black border border-white/10 px-3 py-3 text-sm text-white focus:outline-none focus:border-primary"
              />
              <input
                type="email"
                value={newCollab.email}
                onChange={(e) => setNewCollab({ ...newCollab, email: e.target.value })}
                placeholder="email@example.com"
                className="md:col-span-4 bg-black border border-white/10 px-3 py-3 text-sm text-white focus:outline-none focus:border-primary"
              />
              <select
                value={newCollab.role}
                onChange={(e) => setNewCollab({ ...newCollab, role: e.target.value })}
                className="md:col-span-2 bg-black border border-white/10 px-3 py-3 text-sm text-white focus:outline-none focus:border-primary"
              >
                {DEFAULT_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <div className="md:col-span-2 flex gap-2">
                <input
                  type="number"
                  value={newCollab.share || ''}
                  onChange={(e) => setNewCollab({ ...newCollab, share: parseInt(e.target.value) || 0 })}
                  placeholder="%"
                  min={0}
                  max={100}
                  className="flex-1 bg-black border border-white/10 px-3 py-3 text-sm text-white focus:outline-none focus:border-primary"
                />
                <button
                  onClick={addCollaborator}
                  aria-label="Add collaborator"
                  className="beam bg-white text-black px-4 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — visualizer + info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="manifest-card p-6 bg-dark border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic">
                Allocation
              </h3>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">
                {acceptedShare}% accepted
              </span>
            </div>

            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={collaborators}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="share"
                    stroke="none"
                  >
                    {collaborators.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black italic text-white">{totalShare}%</span>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest italic">Allocated</span>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {collaborators.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-2 h-2 shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="font-black text-white italic truncate">{c.name}</span>
                  </div>
                  <span className="font-black text-white/60 italic shrink-0 ml-2">{c.share}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="manifest-card p-6 bg-dark border border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.3em] italic">
                <Sparkles className="w-3 h-3" /> Auto-payout
              </div>
              <h3 className="text-xl font-black italic text-white leading-tight">
                When the money lands, it splits itself
              </h3>
              <p className="text-[12px] text-white/50 italic leading-relaxed">
                Once everyone's accepted, every dollar of royalty that comes in routes automatically
                to each collaborator's connected payout account. No spreadsheets. No "I'll paypal you
                later." Receipts on file.
              </p>
            </div>
          </div>

          <div className="text-[10px] text-white/30 italic leading-relaxed">
            Drafts auto-save to your browser. Saving the sheet writes to{' '}
            <code className="text-white/50">/api/splits</code> and powers the Earnings page payout
            engine.
          </div>
        </div>
      </div>

      {/* AI Royalty Analysis modal */}
      <AnimatePresence>
        {aiOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
            onClick={() => setAiOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-[var(--card-bg)] border border-white/10"
            >
              <div className="flex items-center justify-between gap-4 p-5 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] italic text-primary">AI Royalty Analysis</div>
                    <div className="text-[10px] text-white/40 italic truncate">Grounded in live SAMRO / ASCAP / BMI / PRS / MLC rules with cited sources</div>
                  </div>
                </div>
                <button onClick={() => setAiOpen(false)} className="text-white/40 shrink-0" aria-label="Close"><XIcon className="w-4 h-4" /></button>
              </div>

              <div className="p-5 overflow-y-auto custom-scrollbar space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    value={aiSong}
                    onChange={(e) => setAiSong(e.target.value)}
                    placeholder="Song title (optional)"
                    className="flex-1 h-11 px-3 bg-[var(--bg-main)] border border-white/10 text-white text-sm italic outline-none focus:border-primary"
                  />
                  <button
                    onClick={runAiAnalysis}
                    disabled={aiLoading || collaborators.length === 0}
                    className="beam h-11 px-6 bg-primary text-white text-[10px] font-black uppercase italic tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 shrink-0"
                  >
                    <Sparkles className={cn('w-3.5 h-3.5', aiLoading && 'animate-pulse')} />
                    {aiLoading ? 'Researching…' : 'Analyze splits'}
                  </button>
                </div>
                <div className="text-[10px] text-white/40 italic">
                  Analyzing {collaborators.length} contributor{collaborators.length !== 1 ? 's' : ''} · total {totalShare}%.
                  {totalShare !== 100 && <span className="text-yellow-400"> Shares don't total 100% — the analysis will flag this.</span>}
                </div>

                {aiError && (
                  <div className="border border-red-500/30 bg-red-500/5 p-4 text-xs text-red-300 italic">{aiError}</div>
                )}

                {aiLoading && (
                  <div className="py-12 text-center text-white/40 italic text-sm">
                    <Sparkles className="w-6 h-6 text-primary/50 mx-auto mb-3 animate-pulse" />
                    Researching current royalty rules across SAMRO, ASCAP, BMI, SESAC, PRS, The MLC & more…
                  </div>
                )}

                {aiReport && (
                  <div className="space-y-5">
                    <div className="border border-white/10 bg-[var(--bg-main)] p-5">
                      <MarkdownLite text={aiReport.text} />
                    </div>
                    {aiReport.sources.length > 0 && (
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest italic text-white/40 mb-2">Sources ({aiReport.sources.length})</div>
                        <div className="space-y-1.5">
                          {aiReport.sources.map((s, i) => (
                            <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="block text-[11px] text-primary italic truncate">
                              ↗ {s.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-[9px] text-white/30 italic">AI-researched guidance, not legal advice. Confirm shares with your collaborators and societies before release.</div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Minimal Markdown renderer for the AI report (headings, bold, bullets). */
function mdInline(s: string) {
  return s.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="text-white font-bold">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>,
  );
}

function MarkdownLite({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm text-white/80 leading-relaxed">
      {lines.map((raw, i) => {
        const line = raw.trimEnd();
        if (!line.trim()) return <div key={i} className="h-2" />;
        if (line.startsWith('### ')) return <h3 key={i} className="text-primary font-black uppercase italic tracking-widest text-[11px] mt-4">{mdInline(line.slice(4))}</h3>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-white font-black uppercase italic tracking-tight text-base mt-5 border-b border-white/10 pb-1.5">{mdInline(line.slice(3))}</h2>;
        if (line.startsWith('# ')) return <h2 key={i} className="text-white font-black uppercase italic text-lg mt-5">{mdInline(line.slice(2))}</h2>;
        if (/^\s*[-*]\s+/.test(line)) return <div key={i} className="flex gap-2 pl-1"><span className="text-primary shrink-0">•</span><span>{mdInline(line.replace(/^\s*[-*]\s+/, ''))}</span></div>;
        if (/^\s*\d+\.\s+/.test(line)) return <div key={i} className="flex gap-2 pl-1"><span className="text-primary shrink-0 font-mono">{line.match(/^\s*(\d+)\./)?.[1]}.</span><span>{mdInline(line.replace(/^\s*\d+\.\s+/, ''))}</span></div>;
        if (line.startsWith('|')) return <div key={i} className="font-mono text-[10px] text-white/55 whitespace-pre-wrap break-words">{line}</div>;
        return <p key={i}>{mdInline(line)}</p>;
      })}
    </div>
  );
}
