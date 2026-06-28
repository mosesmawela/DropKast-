import { Link, useNavigate } from 'react-router-dom';
import { Music, Mail, Lock, User, Globe, ArrowRight, Mic2, Building2, Megaphone, Headphones, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { User as AppUser } from '../types';

type PortalId = 'ARTIST' | 'LABEL' | 'INFLUENCER' | 'DJ';

const PORTALS: { id: PortalId; label: string; tagline: string; desc: string; icon: typeof Mic2; landing: string }[] = [
  { id: 'ARTIST',     label: 'Artist',       tagline: 'I make the music',       desc: 'Distribute your music, run AI-assisted campaigns, get paid.',                                    icon: Mic2,       landing: '/dashboard' },
  { id: 'LABEL',      label: 'Label',        tagline: 'I manage a roster',      desc: 'Distribute multiple artists from one account. Switch between rosters, see catalogue-wide earnings.', icon: Building2,  landing: '/dashboard' },
  { id: 'INFLUENCER', label: 'Influencer',   tagline: 'I create content',       desc: 'Get paid to post, track campaign performance, instant payouts.',                                  icon: Megaphone,  landing: '/influencer/missions' },
  { id: 'DJ',         label: 'DJ / Curator', tagline: 'I move the floor',       desc: 'Get exclusive packs, stems, edits. Send feedback to artists.',                                    icon: Headphones, landing: '/dj/packs' },
];

export default function Signup() {
  const navigate = useNavigate();
  const { signup, updateUser } = useAuth();
  const { setRole } = useTheme();
  const [step, setStep] = useState<'form' | 'portal'>('form');
  const [selectedPortal, setSelectedPortal] = useState<PortalId>('ARTIST');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    artistName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'United States',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.artistName.trim()) errs.artistName = 'Display name is required';
    if (!formData.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email format';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 8) errs.password = 'Minimum 8 characters';
    else if (!/[A-Z]/.test(formData.password)) errs.password = 'Needs an uppercase letter';
    else if (!/[0-9]/.test(formData.password)) errs.password = 'Needs a number';
    if (!formData.confirmPassword) errs.confirmPassword = 'Confirm your password';
    else if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearError = (field: string) => setErrors((p) => ({ ...p, [field]: '' }));

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStep('portal');
  };

  const pickPortal = async (portal: PortalId) => {
    setIsLoading(true);
    setErrors({});
    try {
      await signup(formData.email, formData.password, formData.artistName);
      updateUser({
        role: portal as AppUser['role'],
        artistName: formData.artistName,
        ...(portal === 'LABEL' ? { label: formData.artistName } : {}),
      });
      setRole(portal as AppUser['role']);
      try {
        localStorage.setItem('campaign-os-role', portal);
        localStorage.setItem('dropkast_welcome_seen', 'true');
      } catch {/* ignore */}
      const target = PORTALS.find((p) => p.id === portal)?.landing || '/dashboard';
      navigate(target);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      setErrors({ form: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans uppercase tracking-[0.05em] technical-grid">
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start pointer-events-none opacity-20">
        <div className="text-[10px] font-black text-white/50 tracking-[0.5em] italic">
          {step === 'form' ? 'CREATE ACCOUNT' : 'CHOOSE YOUR PORTAL'}
        </div>
        <div className="barcode-sim h-8 w-24" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("w-full relative z-10", step === 'portal' ? 'max-w-5xl' : 'max-w-2xl')}>
        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="manifest-card corner-marker p-12 bg-black shadow-none border-white/10"
            >
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 border border-primary flex items-center justify-center p-1">
                    <div className="w-full h-full bg-primary animate-pulse" />
                  </div>
                  <span className="text-2xl font-black tracking-tighter text-white italic">DROPKAST</span>
                </div>
                <h1 className="text-5xl font-black text-white mb-2 leading-none uppercase italic">Create your account</h1>
                <p className="text-white/20 text-[9px] font-black tracking-[0.4em] italic uppercase">
                  Step 1 of 2 — credentials. Step 2 — pick your portal.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Display name</label>
                  <div className="relative group">
                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-white transition-colors" />
                    <input
                      type="text"
                      required
                      value={formData.artistName}
                      onChange={(e) => { setFormData({ ...formData, artistName: e.target.value }); clearError('artistName'); }}
                      placeholder="Your artist / label / creator name"
                      className={cn(
                        'w-full bg-transparent border-b py-5 pl-8 pr-4 text-white placeholder:text-white/5 focus:outline-none transition-all text-sm font-black uppercase italic',
                        errors.artistName ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary',
                      )}
                    />
                  </div>
                  {errors.artistName && (
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest font-mono italic">{errors.artistName}</span>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-white transition-colors" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => { setFormData({ ...formData, email: e.target.value }); clearError('email'); }}
                      placeholder="you@email.com"
                      className={cn(
                        'w-full bg-transparent border-b py-5 pl-8 pr-4 text-white placeholder:text-white/5 focus:outline-none transition-all text-sm font-black uppercase italic',
                        errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary',
                      )}
                    />
                  </div>
                  {errors.email && (
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest font-mono italic">{errors.email}</span>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Country</label>
                  <div className="relative group">
                    <Globe className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-white transition-colors" />
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-transparent border-b border-white/10 py-5 pl-8 pr-4 text-white focus:outline-none appearance-none cursor-pointer text-sm font-black italic"
                    >
                      {['United States','Canada','United Kingdom','Germany','France','Australia','South Africa','Nigeria','Kenya','Ghana','Brazil','Mexico','Japan','South Korea','Other'].map((c) => (
                        <option key={c} className="bg-black">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-white transition-colors" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => { setFormData({ ...formData, password: e.target.value }); clearError('password'); }}
                      placeholder="********"
                      className={cn(
                        'w-full bg-transparent border-b py-5 pl-8 pr-4 text-white placeholder:text-white/5 focus:outline-none transition-all text-sm font-black italic',
                        errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary',
                      )}
                    />
                  </div>
                  {errors.password && (
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest font-mono italic">{errors.password}</span>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-white transition-colors" />
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); clearError('confirmPassword'); }}
                      placeholder="********"
                      className={cn(
                        'w-full bg-transparent border-b py-5 pl-8 pr-4 text-white placeholder:text-white/5 focus:outline-none transition-all text-sm font-black italic',
                        errors.confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary',
                      )}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest font-mono italic">{errors.confirmPassword}</span>
                  )}
                </div>

                <div className="md:col-span-2 flex items-start gap-4 py-4 px-0">
                  <div className="manifest-card w-5 h-5 flex items-center justify-center p-0.5 border-white/20 group">
                    <input type="checkbox" id="terms" required className="w-full h-full opacity-0 absolute cursor-pointer z-10 peer" />
                    <div className="w-full h-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                  <label htmlFor="terms" className="text-[10px] font-black text-white/40 tracking-[0.1em] leading-relaxed italic">
                    I agree to the <Link to="/terms" target="_blank" className="text-white hover:text-primary transition-colors italic border-b border-white/20">Terms of Service</Link> and <Link to="/privacy" target="_blank" className="text-white hover:text-primary transition-colors italic border-b border-white/20">Privacy Policy</Link>
                  </label>
                </div>

                <button
                  type="submit"
                  className="primary-button h-16 md:col-span-2 bg-white text-black hover:bg-primary hover:text-white flex items-center justify-between px-10"
                >
                  <span className="text-[12px] font-black tracking-widest uppercase italic">Continue → Pick portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="portal"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-5xl"
            >
              <button
                type="button"
                onClick={() => setStep('form')}
                disabled={isLoading}
                className="mb-6 flex items-center gap-2 text-[10px] font-mono font-black text-white/40 hover:text-white tracking-[0.3em] uppercase italic transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" /> Back to credentials
              </button>

              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-none uppercase italic font-mono tracking-tighter">
                  Which <span className="text-primary">portal</span>?
                </h1>
                <p className="text-white/40 text-[10px] font-black tracking-[0.4em] italic uppercase font-mono">
                  Pick how you'll use DropKast — you can switch anytime
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {PORTALS.map((p) => {
                  const active = selectedPortal === p.id;
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() => setSelectedPortal(p.id)}
                      onDoubleClick={() => pickPortal(p.id)}
                      className={cn(
                        'manifest-card relative p-7 text-left flex flex-col gap-5 transition-all border bg-white/[0.02] hover:bg-white/[0.05] min-h-[300px] group disabled:opacity-50 disabled:cursor-wait',
                        active ? 'border-primary scale-[1.02]' : 'border-white/10',
                      )}
                      style={
                        active
                          ? { boxShadow: '0 0 0 1px var(--color-primary), 0 30px 80px rgba(255,77,0,0.2)' }
                          : undefined
                      }
                    >
                      <div className={cn('w-14 h-14 border flex items-center justify-center transition-all', active ? 'border-primary' : 'border-white/10')}>
                        <Icon className={cn('w-7 h-7', active ? 'text-primary' : 'text-white/50')} />
                      </div>

                      <div>
                        <div className={cn('text-[10px] font-mono font-black uppercase tracking-[0.3em] italic mb-2', active ? 'text-primary' : 'text-white/40')}>
                          {p.tagline}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter font-mono leading-none text-white">
                          {p.label}
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

              {errors.form && (
                <div className="max-w-2xl mx-auto mb-4 p-4 bg-red-900/20 border border-red-500/30">
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest font-mono italic">{errors.form}</span>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => pickPortal(selectedPortal)}
                  className="primary-button h-16 flex-1 bg-white text-black hover:bg-primary hover:text-white flex items-center justify-between px-8 transition-all disabled:opacity-30"
                >
                  <span className="text-[12px] font-mono font-black tracking-widest uppercase italic">
                    {isLoading ? 'Provisioning...' : `Continue as ${PORTALS.find(p => p.id === selectedPortal)?.label}`}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {isLoading && (
                <div className="mt-8 text-center">
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest italic animate-pulse">
                    Provisioning your portal…
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 text-center relative">
          <div className="barcode-sim h-4 w-20 mx-auto opacity-10 mb-4" />
          <p className="text-white/30 text-[11px] font-black tracking-[0.1em] flex items-center justify-center gap-4 italic">
            Already have an account? <Link to="/login" className="text-primary hover:underline italic">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
