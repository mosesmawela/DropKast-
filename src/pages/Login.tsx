import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Github, Terminal, Music, Camera, Disc, ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, UserRole } from '../context/ThemeContext';
import { cn } from '../lib/utils';

const PORTALS: {
  id: UserRole;
  name: string;
  tagline: string;
  desc: string;
  icon: React.ElementType;
  landing: string;
}[] = [
  {
    id: 'ARTIST',
    name: 'Artist Core',
    tagline: 'I make the music',
    desc: 'Distribution, AI assets, campaign OS, A&R submission.',
    icon: Music,
    landing: '/dashboard',
  },
  {
    id: 'INFLUENCER',
    name: 'Creator Relay',
    tagline: 'I create content',
    desc: 'Paid missions, performance tracking, instant payouts.',
    icon: Camera,
    landing: '/influencer/missions',
  },
  {
    id: 'DJ',
    name: 'Vibe Selecta',
    tagline: 'I move the floor',
    desc: 'Exclusive packs, stems, edits, feedback channel.',
    icon: Disc,
    landing: '/dj/packs',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { role, setRole } = useTheme();

  const [step, setStep] = useState<'portal' | 'creds'>('portal');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const selectedPortal = PORTALS.find((p) => p.id === role) ?? PORTALS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(form.email, form.email.split('@')[0]);
      navigate(selectedPortal.landing);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans uppercase tracking-[0.05em] technical-grid">
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start pointer-events-none opacity-20">
        <div className="text-[10px] font-black text-white/50 tracking-[0.5em] italic">SECURE_INGESTION_v4.2</div>
        <div className="barcode-sim h-8 w-24" />
      </div>

      <AnimatePresence mode="wait">
        {step === 'portal' ? (
          <motion.div
            key="portal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-5xl"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-10 h-10 border border-primary flex items-center justify-center p-1">
                  <div className="w-full h-full bg-primary animate-pulse" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-white italic font-mono">DROPKAST</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-3 leading-none uppercase italic font-mono tracking-tighter">
                Choose Your Portal
              </h1>
              <p className="text-white/40 text-[10px] font-black tracking-[0.4em] italic uppercase font-mono">
                Select your role to continue → identity verification
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              {PORTALS.map((p) => {
                const active = role === p.id;
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => setRole(p.id)}
                    onDoubleClick={() => {
                      setRole(p.id);
                      setStep('creds');
                    }}
                    className={cn(
                      'manifest-card relative p-7 text-left flex flex-col gap-5 transition-all border bg-white/[0.02] hover:bg-white/[0.05] min-h-[300px] group',
                      active ? 'border-primary scale-[1.02]' : 'border-white/10',
                    )}
                    style={
                      active
                        ? { boxShadow: '0 0 0 1px var(--color-primary), 0 30px 80px rgba(255,77,0,0.2)' }
                        : undefined
                    }
                  >
                    <div
                      className={cn(
                        'w-14 h-14 border flex items-center justify-center transition-all',
                        active ? 'border-primary' : 'border-white/10',
                      )}
                    >
                      <Icon className={cn('w-7 h-7', active ? 'text-primary' : 'text-white/50')} />
                    </div>

                    <div>
                      <div
                        className={cn(
                          'text-[10px] font-mono font-black uppercase tracking-[0.3em] italic mb-2',
                          active ? 'text-primary' : 'text-white/40',
                        )}
                      >
                        {p.tagline}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter font-mono leading-none text-white">
                        {p.name}
                      </h3>
                    </div>

                    <p className="text-sm text-white/60 leading-relaxed">{p.desc}</p>

                    {active && (
                      <div className="absolute top-4 right-4 flex items-center gap-2 text-[9px] font-mono font-black uppercase tracking-[0.3em] text-primary italic">
                        <CheckCircle2 className="w-4 h-4" />
                        Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <button
                onClick={() => setStep('creds')}
                className="primary-button h-16 flex-1 bg-white text-black hover:bg-primary hover:text-white flex items-center justify-between px-8 transition-all"
              >
                <span className="text-[12px] font-mono font-black tracking-widest uppercase italic">
                  Continue as {selectedPortal.name}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-10 text-center">
              <p className="text-white/30 text-[9px] font-mono font-black uppercase tracking-[0.3em] italic">
                Don't have an account yet?{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  Provision New Identity
                </Link>
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="creds"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg"
          >
            <button
              onClick={() => setStep('portal')}
              className="mb-6 flex items-center gap-2 text-[10px] font-mono font-black text-white/40 hover:text-white tracking-[0.3em] uppercase italic transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Change Portal
            </button>

            <div className="manifest-card corner-marker p-12 relative bg-black shadow-none border-white/10">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 border border-primary flex items-center justify-center p-1">
                    <selectedPortal.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-2xl font-black tracking-tighter text-white italic font-mono">
                      {selectedPortal.name.toUpperCase().replace(' ', '_')}
                    </span>
                    <div className="text-[9px] font-mono font-black text-white/40 uppercase tracking-[0.3em] italic">
                      {selectedPortal.tagline}
                    </div>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2 leading-none uppercase italic font-mono">
                  Terminal Access
                </h1>
                <p className="text-white/20 text-[9px] font-black tracking-[0.4em] italic uppercase">
                  Awaiting Identity Credentials
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">
                    INPUT::USER_IDENTITY
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-white transition-colors" />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="ID@STORAGE.CORE"
                      className="w-full bg-transparent border-b border-white/10 py-5 pl-8 pr-4 text-white placeholder:text-white/5 focus:outline-none focus:border-primary transition-all text-sm font-black uppercase italic"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-0">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">
                      INPUT::SECURITY_HEX
                    </label>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-white transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="********"
                      className="w-full bg-transparent border-b border-white/10 py-5 pl-8 pr-14 text-white placeholder:text-white/5 focus:outline-none focus:border-primary transition-all text-sm font-black italic"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors px-2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  className="primary-button w-full h-16 bg-white text-black hover:bg-primary hover:text-white active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-between px-8"
                >
                  <span className="text-[12px] font-black tracking-widest uppercase italic">
                    {isLoading ? 'PROVISIONING...' : `ENTER ${selectedPortal.name.toUpperCase()}`}
                  </span>
                  <Terminal className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-12 pt-8 border-t border-dotted border-white/10 flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-white/5" />
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] italic">
                    EXTERNAL_NODES
                  </span>
                  <div className="h-[1px] flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button className="h-12 border border-white/5 text-[9px] font-black text-white/20 uppercase tracking-widest hover:border-white hover:text-white transition-all flex items-center justify-center gap-2">
                    <User className="w-3 h-3" /> GOOGLE
                  </button>
                  <button className="h-12 border border-white/5 text-[9px] font-black text-white/20 uppercase tracking-widest hover:border-white hover:text-white transition-all flex items-center justify-center gap-2">
                    <Github className="w-3 h-3" /> GITHUB
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 text-center relative">
              <div className="barcode-sim h-4 w-20 mx-auto opacity-10 mb-4" />
              <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4">
                NO_IDENTITY?{' '}
                <Link to="/signup" className="text-primary hover:underline italic">
                  PROVISION_NEW_RECORD
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
