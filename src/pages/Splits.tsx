import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { 
  FileText, 
  Users, 
  Plus, 
  Trash2, 
  Download, 
  DollarSign, 
  Sparkles, 
  ChevronRight, 
  Target, 
  Check, 
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { cn } from '../lib/utils';
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';
import { motion, AnimatePresence } from 'motion/react';
import { useNotify } from '../context/NotificationContext';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: string;
  share: number;
}

export default function Splits() {
  const { notify } = useNotify();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: '1', name: 'Neon Void', email: 'artist@neonvoid.com', role: 'Artist / Writer', share: 50 },
    { id: '2', name: 'Static Producer', email: 'prod@static.com', role: 'Producer', share: 50 },
  ]);

  const [newCollab, setNewCollab] = useState({ name: '', email: '', role: '', share: 0 });
  const COLORS = ['#FF4D00', '#ffffff', '#333333', '#666666'];

  const calculateSplits = (participants: Collaborator[]) => {
    return participants.reduce((sum, p) => sum + p.share, 0);
  };

  const totalShare = calculateSplits(collaborators);

  const addCollaborator = () => {
    if (!newCollab.name || !newCollab.email || newCollab.share <= 0) {
      notify('error', 'VALIDATION_FAILED', 'Identity and share parameters must be explicitly defined.');
      return;
    }
    
    if (totalShare + newCollab.share > 100) {
      notify('error', 'QUOTA_EXCEEDED', 'Composite share allocation cannot exceed 100%.');
      return;
    }

    setCollaborators([...collaborators, { ...newCollab, id: Math.random().toString() }]);
    setNewCollab({ name: '', email: '', role: '', share: 0 });
    notify('success', 'IDENTITY_LINKED', `${newCollab.name} has been added to the ownership matrix.`);
  };

  const updateShare = (id: string, newShare: number) => {
    setCollaborators(prev => prev.map(c => c.id === id ? { ...c, share: newShare } : c));
  };

  const removeCollaborator = (id: string, name: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
    notify('info', 'IDENTITY_DECOUPLED', `${name} removed from the current split cluster.`);
  };

  const handleExport = async () => {
    if (totalShare !== 100) {
      notify('error', 'INTEGRITY_COMPROMISED', 'Ownership matrix must total 100% for legal export.');
      return;
    }
    notify('ai', 'COMPILING_LEGAL_DOC', 'Generating PDF split sheets and preparing smart contract manifests...');
    
    try {
      const response = await fetch('/api/splits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collaborators, totalShare })
      });

      if (!response.ok) throw new Error('Export failed');

      notify('success', 'EXPORT_READY', 'Legal split packets have been encrypted and sent to your storage.');
    } catch (err) {
      notify('error', 'EXPORT_ERROR', 'Failed to generate legal split documents.');
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8 font-sans">
      <ScrollReveal direction="down">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-2 text-primary mb-3 font-mono">
              <FileText className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest italic font-mono">Financial Protocol</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white italic font-mono uppercase">Split Generator</h1>
          </div>
          <div className="flex items-center gap-4">
            <AnimatedBeam containerClassName="w-fit">
              <button 
                onClick={handleExport}
                disabled={totalShare !== 100}
                className={cn(
                  "primary-button h-14 flex items-center gap-3 px-10",
                  totalShare !== 100 && "opacity-50 grayscale cursor-not-allowed"
                )}
              >
                <Download className="w-4 h-4" />
                Export Split Sheet (PDF)
              </button>
            </AnimatedBeam>
          </div>
        </header>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Collaborative Splits List */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-[0.2em] font-mono uppercase italic">Ownership Matrix</h3>
              <div className={cn(
                "px-5 py-2 text-[10px] font-black font-mono tracking-widest uppercase border",
                totalShare === 100 ? "border-green-500 text-green-500 bg-green-500/5" : "border-red-500 text-red-500 bg-red-500/5"
              )}>
                {totalShare}% TOTALED
              </div>
           </div>

           <div className="space-y-4">
              <AnimatePresence>
                {collaborators.map((collab) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    key={collab.id} 
                    className="p-8 bg-dark border border-white/5 space-y-6 group hover:border-primary/20 transition-all shadow-xl font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8 flex-1">
                         <div className="w-12 h-12 border border-white/10 flex items-center justify-center bg-white/5 italic font-black text-primary">
                            {collab.name.substring(0, 2).toUpperCase()}
                         </div>
                         <div className="grid grid-cols-2 gap-16 flex-1">
                            <div className="space-y-1">
                               <div className="text-lg font-bold text-white italic truncate">{collab.name}</div>
                               <div className="text-[10px] text-white/20 uppercase tracking-widest">{collab.email}</div>
                            </div>
                            <div className="space-y-1">
                               <div className="text-[10px] text-white/40 uppercase tracking-widest">Legal Role</div>
                               <div className="text-[11px] font-bold text-primary italic uppercase">{collab.role}</div>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-12">
                         <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Net Share</span>
                            <span className="text-4xl font-black text-white italic">{collab.share}%</span>
                         </div>
                         <button 
                           onClick={() => removeCollaborator(collab.id, collab.name)}
                           className="w-10 h-10 border border-white/5 flex items-center justify-center text-white/10 hover:text-red-500 hover:border-red-500/40 transition-all opacity-0 group-hover:opacity-100"
                          >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex items-center gap-6">
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={collab.share}
                        onChange={(e) => updateShare(collab.id, parseInt(e.target.value))}
                        className="flex-1 accent-primary bg-white/5 h-1 appearance-none cursor-pointer rounded-full"
                      />
                      <div className="flex gap-2">
                        {[10, 25, 50].map(val => (
                          <button 
                            key={val}
                            onClick={() => updateShare(collab.id, val)}
                            className="px-2 py-1 bg-white/5 border border-white/10 text-[8px] font-black text-white/40 hover:text-white hover:border-white transition-all uppercase tracking-widest"
                          >
                            {val}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>

           <div className="p-10 bg-white/5 border border-white/5 space-y-8">
              <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono italic">Add Collaborator Node</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <input 
                   type="text" 
                   value={newCollab.name}
                   onChange={e => setNewCollab({...newCollab, name: e.target.value})}
                   placeholder="Legal Name" 
                   className="bg-black border border-white/10 p-4 text-xs font-mono tracking-widest text-white outline-none focus:border-primary transition-all uppercase"
                 />
                 <input 
                   type="email" 
                   value={newCollab.email}
                   onChange={e => setNewCollab({...newCollab, email: e.target.value})}
                   placeholder="Email Address" 
                   className="bg-black border border-white/10 p-4 text-xs font-mono tracking-widest text-white outline-none focus:border-primary transition-all uppercase"
                 />
                 <input 
                   type="text" 
                   value={newCollab.role}
                   onChange={e => setNewCollab({...newCollab, role: e.target.value})}
                   placeholder="Role (e.g. Writer)" 
                   className="bg-black border border-white/10 p-4 text-xs font-mono tracking-widest text-white outline-none focus:border-primary transition-all uppercase"
                 />
                 <div className="flex gap-4">
                   <input 
                     type="number" 
                     value={newCollab.share}
                     onChange={e => setNewCollab({...newCollab, share: parseInt(e.target.value) || 0})}
                     placeholder="Share %" 
                     className="bg-black border border-white/10 p-4 text-xs font-mono tracking-widest text-white outline-none focus:border-primary transition-all flex-1"
                   />
                   <button 
                     onClick={addCollaborator}
                     className="bg-white text-black px-6 hover:bg-primary hover:text-white transition-all"
                    >
                     <Plus className="w-5 h-5" />
                   </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <div className="p-10 bg-dark border border-white/5 space-y-8 shadow-2xl relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic font-mono">Visualizer_v1.0</h3>
                <div className="barcode-sim opacity-10" />
              </div>

              <div className="h-64 relative flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                        data={collaborators}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="share"
                        stroke="none"
                     >
                        {collaborators.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                   </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-black text-white italic">{totalShare}%</span>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic font-mono">Allocated</span>
                 </div>
              </div>

              <div className="space-y-4">
                 {collaborators.map((collab, i) => (
                   <div key={collab.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                         <span className="text-[10px] font-bold text-white italic uppercase truncate max-w-[120px]">{collab.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">EST_REV</span>
                         <span className="text-[11px] font-black text-white font-mono italic">${((collab.share / 100) * 1000).toFixed(2)}</span>
                      </div>
                   </div>
                 ))}
                 <div className="pt-4 border-t border-white/5">
                    <p className="text-[9px] text-white/20 italic leading-relaxed">
                      *Estimated revenue based on projected $1,000 algorithmic quarterly return node.
                    </p>
                 </div>
              </div>
           </div>

           <div className="p-10 bg-dark border border-white/5 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                 <ShieldCheck className="w-16 h-16 text-primary" />
              </div>
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3 text-primary font-mono font-black italic text-[11px] uppercase tracking-widest">
                   <Target className="w-4 h-4" />
                   LEGAL_PROTOCOL
                 </div>
                 <h3 className="text-3xl font-black italic font-mono uppercase tracking-tight text-white leading-none">Smart Contract Integration</h3>
                 <p className="text-xs text-white/40 italic font-medium leading-relaxed font-sans">
                    Once the split sheet is generated and signed, our system automatically tracks incoming royalties from all connected platforms and calculates individual payouts based on these percentages.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
