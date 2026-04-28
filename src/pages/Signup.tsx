import { Link, useNavigate } from 'react-router-dom';
import { Music, Mail, Lock, User, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const aliasId = React.useId();
  const emailId = React.useId();
  const countryId = React.useId();
  const passwordId = React.useId();
  const confirmPasswordId = React.useId();
  const [formData, setFormData] = useState({
    artistName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'United States'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In mock mode, we just log them in with the artist name they provided
    login(formData.email, formData.password, formData.artistName);
    setIsLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans uppercase tracking-[0.05em] technical-grid">
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start pointer-events-none opacity-20">
         <div className="text-[10px] font-black text-white/50 tracking-[0.5em] italic">PROVISIONING_v2.0</div>
         <div className="barcode-sim h-8 w-24" />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="manifest-card corner-marker p-12 bg-black shadow-none border-white/10">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-primary flex items-center justify-center p-1">
                 <div className="w-full h-full bg-primary animate-pulse" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white italic">S_WAVE_OS</span>
            </div>
            <h1 className="text-5xl font-black text-white mb-2 leading-none uppercase italic">PROVISION_RECORD</h1>
            <p className="text-white/20 text-[9px] font-black tracking-[0.4em] italic uppercase">INITIALIZING_GLOBAL_IDENTITY_MIRROR</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3 md:col-span-2">
              <label
                htmlFor={aliasId}
                className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic cursor-pointer"
              >
                INPUT::ALIAS_ID
              </label>
              <div className="relative group">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-white transition-colors" />
                <input 
                  id={aliasId}
                  type="text" 
                  required
                  value={formData.artistName}
                  onChange={e => setFormData({ ...formData, artistName: e.target.value })}
                  placeholder="e.g. ABEL_TESFAYE"
                  className="w-full bg-transparent border-b border-white/10 py-5 pl-8 pr-4 text-white placeholder:text-white/5 focus:outline-none focus:border-primary transition-all text-sm font-black uppercase italic"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label
                htmlFor={emailId}
                className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic cursor-pointer"
              >
                INPUT::COMM_NODE
              </label>
              <div className="relative group">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-white transition-colors" />
                <input 
                  id={emailId}
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ID@STORAGE.CORE"
                  className="w-full bg-transparent border-b border-white/10 py-5 pl-8 pr-4 text-white placeholder:text-white/5 focus:outline-none focus:border-primary transition-all text-sm font-black uppercase italic"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label
                htmlFor={countryId}
                className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic cursor-pointer"
              >
                INPUT::JURISDICTION
              </label>
              <div className="relative group">
                <Globe className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-white transition-colors" />
                <select 
                  id={countryId}
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-transparent border-b border-white/10 py-5 pl-8 pr-4 text-white focus:outline-none appearance-none cursor-crosshair text-sm font-black uppercase italic"
                >
                  <option className="bg-black">UNITED_STATES</option>
                  <option className="bg-black">CANADA</option>
                  <option className="bg-black">UNITED_KINGDOM</option>
                  <option className="bg-black">GERMANY</option>
                  <option className="bg-black">FRANCE</option>
                  <option className="bg-black">AUSTRALIA</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label
                htmlFor={passwordId}
                className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic cursor-pointer"
              >
                INPUT::HEX_PASS
              </label>
              <div className="relative group">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-white transition-colors" />
                <input 
                  id={passwordId}
                  type="password" 
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="********"
                  className="w-full bg-transparent border-b border-white/10 py-5 pl-8 pr-4 text-white placeholder:text-white/5 focus:outline-none focus:border-primary transition-all text-sm font-black italic"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label
                htmlFor={confirmPasswordId}
                className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic cursor-pointer"
              >
                INPUT::HEX_VERIFY
              </label>
              <div className="relative group">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-white transition-colors" />
                <input 
                  id={confirmPasswordId}
                  type="password" 
                  required
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="********"
                  className="w-full bg-transparent border-b border-white/10 py-5 pl-8 pr-4 text-white placeholder:text-white/5 focus:outline-none focus:border-primary transition-all text-sm font-black italic"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex items-start gap-4 py-4 px-0">
               <div className="manifest-card w-5 h-5 flex items-center justify-center p-0.5 border-white/20 group">
                  <input type="checkbox" id="terms" required className="w-full h-full opacity-0 absolute cursor-pointer z-10 peer" />
                  <div className="w-full h-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity"></div>
               </div>
               <label htmlFor="terms" className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] leading-relaxed italic">
                 I_ACCEPT <a href="#" className="text-white hover:text-primary transition-colors italic border-b border-white/20">SERVICE_PROTOCOLS</a> AND <a href="#" className="text-white hover:text-primary transition-colors italic border-b border-white/20">DATA_RELIABILITY_STANDARDS</a>
               </label>
            </div>

            <button 
              disabled={isLoading}
              className="primary-button h-16 md:col-span-2 bg-white text-black hover:bg-primary hover:text-white flex items-center justify-between px-10"
            >
              <span className="text-[12px] font-black tracking-widest uppercase italic">
                {isLoading ? "INITIALIZING_MIRROR..." : "ESTABLISH_ARCHIVE_IDENTITY"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="mt-12 text-center relative">
          <div className="barcode-sim h-4 w-20 mx-auto opacity-10 mb-4" />
          <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 italic">
            RECORD_EXISTS? <Link to="/login" className="text-primary hover:underline italic">INITIATE_LOGIN</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
