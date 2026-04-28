import { Link, useNavigate } from 'react-router-dom';
import { Music, Eye, EyeOff, Mail, Lock, User, Github, Terminal } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(form.email, form.email.split('@')[0]);
      navigate('/dashboard');
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

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-lg"
      >
        <div className="manifest-card corner-marker p-12 relative bg-black shadow-none border-white/10">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-primary flex items-center justify-center p-1">
                 <div className="w-full h-full bg-primary animate-pulse" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white italic">S_WAVE_OS</span>
            </div>
            <h1 className="text-5xl font-black text-white mb-2 leading-none uppercase italic">TERMINAL_ACCESS</h1>
            <p className="text-white/20 text-[9px] font-black tracking-[0.4em] italic uppercase">AWAITING_IDENTITY_CREDENTIALS</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">INPUT::USER_IDENTITY</label>
              <div className="relative group">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-white transition-colors" />
                <input 
                  type="email" 
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="ID@STORAGE.CORE"
                  className="w-full bg-transparent border-b border-white/10 py-5 pl-8 pr-4 text-white placeholder:text-white/5 focus:outline-none focus:border-primary transition-all text-sm font-black uppercase italic"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-0">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">INPUT::SECURITY_HEX</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-white transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
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
                {isLoading ? "PROVISIONING..." : "ENTER_MANIFEST"}
              </span>
              <Terminal className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-dotted border-white/10 flex flex-col gap-8">
             <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-white/5"></div>
                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] italic">EXTERNAL_NODES</span>
                <div className="h-[1px] flex-1 bg-white/5"></div>
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

        <div className="mt-12 text-center relative">
          <div className="barcode-sim h-4 w-20 mx-auto opacity-10 mb-4" />
          <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4">
            NO_IDENTITY? <Link to="/signup" className="text-primary hover:underline italic">PROVISION_NEW_RECORD</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
