import { Link, useNavigate } from 'react-router-dom';
import { Music, Mail, Lock, User, Globe, ArrowRight, Mic2, Building2, Megaphone, Headphones, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import type { User as AppUser } from '../types';

type PortalId = 'ARTIST' | 'LABEL' | 'INFLUENCER' | 'DJ';

const PORTALS: { id: PortalId; label: string; tagline: string; icon: typeof Mic2; landing: string }[] = [
  { id: 'ARTIST',     label: 'Artist',       tagline: 'I make music and release it.',                           icon: Mic2,       landing: '/dashboard' },
  { id: 'LABEL',      label: 'Label',        tagline: 'I run a label with multiple artists on my roster.',      icon: Building2,  landing: '/dashboard' },
  { id: 'INFLUENCER', label: 'Influencer',   tagline: 'I create content and want paid missions for artists.',   icon: Megaphone,  landing: '/influencer/missions' },
  { id: 'DJ',         label: 'DJ / Curator', tagline: 'I play sets and break music — send me edits and packs.', icon: Headphones, landing: '/dj/packs' },
];

export default function Signup() {
  const navigate = useNavigate();
  const { login, updateUser } = useAuth();
  const [step, setStep] = useState<'form' | 'portal'>('form');
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
    try {
      await login(formData.email, formData.artistName, formData.password);
      // Patch role + label hints once auth lands. AuthContext.updateUser persists to legacy storage.
      updateUser({
        role: portal as AppUser['role'],
        ...(portal === 'LABEL' ? { label: formData.artistName } : {}),
      });
      try {
        localStorage.setItem('campaign-os-role', portal);
        localStorage.setItem('dropkast_welcome_seen', 'true');
      } catch {/* ignore */}
      const target = PORTALS.find((p) => p.id === portal)?.landing || '/dashboard';
      navigate(target);
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

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl relative z-10">
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
              className="manifest-card corner-marker p-12 bg-black shadow-none border-white/10"
            >
              <div className="mb-10">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  disabled={isLoading}
                  className="text-[10px] font-black text-white/40 hover:text-white uppercase italic tracking-widest inline-flex items-center gap-1 mb-6 disabled:opacity-30"
                >
                  <ChevronLeft className="w-3 h-3" /> Back to credentials
                </button>
                <h1 className="text-5xl font-black text-white mb-3 leading-none uppercase italic">
                  Which <span className="text-primary">portal</span>?
                </h1>
                <p className="text-white/40 text-sm italic max-w-xl">
                  DropKast serves four sides of the music economy. Pick the one that's you — you can switch later in Settings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PORTALS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() => pickPortal(p.id)}
                      className="manifest-card group p-6 bg-black border border-white/10 hover:border-primary hover:bg-primary/5 transition-all text-left flex items-start gap-4 disabled:opacity-50 disabled:cursor-wait"
                    >
                      <div className="w-12 h-12 border border-white/20 group-hover:border-primary flex items-center justify-center shrink-0 transition-all">
                        <Icon className="w-5 h-5 text-white/60 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-black italic text-white mb-1 uppercase tracking-tight">{p.label}</div>
                        <p className="text-[11px] text-white/40 italic leading-snug normal-case tracking-normal">{p.tagline}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors mt-1" />
                    </button>
                  );
                })}
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
