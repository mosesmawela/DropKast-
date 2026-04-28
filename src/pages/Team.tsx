import { 
  Users, 
  UserPlus, 
  MoreHorizontal, 
  Shield, 
  Mail, 
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Percent,
  PlusCircle,
  Sparkles,
  Download,
  Terminal,
  Gavel
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useState } from 'react';

const teamMembers = [
  { id: 1, name: 'Abel Tesfaye', email: 'abel@xo.com', role: 'Artist (Owner)', status: 'Active', avatar: 'https://picsum.photos/seed/abel/100/100' },
  { id: 2, name: 'Lamar Taylor', email: 'lamar@xo.com', role: 'Creative Director', status: 'Active', avatar: 'https://picsum.photos/seed/lamar/100/100' },
  { id: 3, name: 'Sal Slaiby', email: 'sal@xo.com', role: 'Manager', status: 'Active', avatar: 'https://picsum.photos/seed/sal/100/100' },
  { id: 4, name: 'Daft Punk', email: 'robots@random.com', role: 'Producer', status: 'Pending', avatar: 'https://picsum.photos/seed/daft/100/100' },
];

export default function Team() {
  const [activeTab, setActiveTab] = useState<'roster' | 'splits' | 'legal'>('roster');

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8 font-sans">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-2 text-primary mb-3 font-mono">
            <Sparkles className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-widest italic">Team AI</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white italic font-mono uppercase">Team & Legal</h1>
        </div>
        <div className="flex gap-4">
          <button className="secondary-button h-14 flex items-center gap-3 px-8 font-mono">
            <FileText className="w-4 h-4" />
            Export Logs
          </button>
          <button className="primary-button h-14 flex items-center gap-3 px-10">
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </header>

      {/* Internal Navigation */}
      <div className="flex gap-1 bg-surface-low p-1 border border-white/10 max-w-fit font-mono">
        {[
          { id: 'roster', label: 'Team Members', icon: Users },
          { id: 'splits', label: 'Royalties', icon: Percent },
          { id: 'legal', label: 'Legal Docs', icon: Gavel },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-3 px-10 py-4 text-[11px] font-bold tracking-widest transition-all italic uppercase",
              activeTab === tab.id ? "bg-primary text-black" : "text-white/40 hover:text-white"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'roster' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="bg-dark border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="text" 
                  placeholder="Search team members..."
                  className="w-full bg-black/40 border border-white/5 py-4 pl-14 pr-4 text-sm font-sans font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-all shadow-inner"
                />
              </div>
              <p className="text-[11px] font-bold text-white/10 tracking-widest italic font-mono uppercase">Total: {teamMembers.length}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20">
                    <th className="px-8 py-6 text-[11px] font-bold text-white/30 uppercase tracking-widest italic font-mono">Name</th>
                    <th className="px-8 py-6 text-[11px] font-bold text-white/30 uppercase tracking-widest italic font-mono">Role</th>
                    <th className="px-8 py-6 text-[11px] font-bold text-white/30 uppercase tracking-widest italic font-mono">Status</th>
                    <th className="px-8 py-6 text-[11px] font-bold text-white/30 uppercase tracking-widest italic text-right font-mono">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 italic">
                  {teamMembers.map((member, i) => (
                    <tr key={member.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-7 font-sans">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 border border-white/5 p-1 group-hover:border-primary transition-all bg-black/40">
                            <img src={member.avatar} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-opacity" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-white tracking-tight group-hover:text-primary transition-all decoration-primary/30 underline-offset-4">{member.name}</p>
                            <p className="text-[11px] text-white/20 flex items-center gap-2 mt-1 lowercase tracking-wide font-medium">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-7 font-mono">
                        <div className="flex items-center gap-3">
                           <Shield className={cn("w-4 h-4 transition-colors", member.role.includes('Owner') ? 'text-primary' : 'text-white/10')} />
                           <span className="text-[11px] font-bold text-white/50 tracking-widest uppercase">{member.role}</span>
                        </div>
                      </td>
                      <td className="px-8 py-7 font-mono">
                        <div className={cn(
                          "inline-flex items-center gap-3 px-4 py-1.5 border text-[10px] font-bold uppercase tracking-widest",
                          member.status === 'Active' ? 'border-primary/20 text-primary' : 'border-white/10 text-white/20 italic'
                        )}>
                          {member.status === 'Active' ? 'Active' : 'Pending'}
                        </div>
                      </td>
                      <td className="px-8 py-7 text-right">
                        <button className="p-3 text-white/10 hover:text-white transition-colors bg-white/5">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'splits' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="p-10 bg-dark border border-white/5 space-y-10 shadow-2xl">
              <h3 className="text-2xl font-black italic tracking-tighter uppercase underline decoration-primary underline-offset-8 font-mono">Royalties Setup</h3>
              <div className="space-y-6">
                {['Master Rights', 'Publishing', 'Performance'].map(type => (
                  <div key={type} className="p-8 bg-black/40 border border-white/5 space-y-6">
                    <div className="flex justify-between items-center text-[11px] font-bold tracking-widest font-mono">
                      <span className="text-white/40 uppercase italic">{type}</span>
                      <span className="text-primary italic">CONFIGURED</span>
                    </div>
                    <div className="space-y-3">
                       {teamMembers.slice(0, 3).map((m, i) => (
                         <div key={i} className="flex justify-between items-center bg-white/5 p-4 border border-white/5 group hover:border-primary/30 transition-all">
                           <span className="text-xs font-bold uppercase font-sans tracking-wide text-white/80">{m.name}</span>
                           <span className="text-lg font-black italic font-mono text-white">{i === 0 ? '70%' : '15%'}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
               <div className="p-10 border border-white/5 bg-white/5 flex items-start gap-8 shadow-xl">
                  <Terminal className="w-8 h-8 text-primary mt-1" />
                  <div className="space-y-5">
                    <h4 className="text-xs font-bold uppercase tracking-widest italic text-primary font-mono">Smart Split AI</h4>
                    <p className="text-sm font-sans leading-relaxed text-white/60 italic font-medium">
                      "I've analyzed producer fees for someone like 'Daft Punk' based on current industry standards. I suggest a 25% publishing share + a $5,000 buyout fee."
                    </p>
                    <button className="primary-button w-full h-14 text-xs font-mono">
                      Create Contract
                    </button>
                  </div>
               </div>
               
               <div className="p-10 bg-dark border border-white/5 space-y-6 shadow-xl italic">
                 <div className="flex items-center gap-3 font-mono">
                   <Percent className="w-5 h-5 text-white/20" />
                   <span className="text-[11px] font-bold text-white/20 uppercase tracking-widest">Payout Info</span>
                 </div>
                 <p className="text-sm text-white/30 font-sans italic font-medium leading-relaxed">Automation ensures instant royalty calculations when your songs are streamed. You never have to deal with manual spreadsheets.</p>
               </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'legal' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 font-mono">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Artist Mgmt', desc: 'Exclusivity protocols and commission logic.', complexity: 'HIGH' },
              { title: 'Work-For-Hire', desc: 'One-time session buyout agreements.', complexity: 'LOW' },
              { title: 'Brand Licensing', desc: 'Sync rights and commercial usage nodes.', complexity: 'MED' },
            ].map((doc, i) => (
              <div key={i} className="p-8 bg-dark border border-white/5 space-y-6 group cursor-pointer hover:border-primary/50 transition-all shadow-xl">
                <div className="flex justify-between items-center">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic">Complexity: {doc.complexity}</span>
                </div>
                <h4 className="text-base font-bold italic uppercase tracking-tighter group-hover:text-primary transition-all">{doc.title}</h4>
                <p className="text-xs font-sans text-white/40 leading-relaxed italic font-medium">{doc.desc}</p>
                <button className="w-full h-12 border border-white/5 text-[10px] uppercase font-bold tracking-widest group-hover:bg-white group-hover:text-black transition-all">
                  Draft with AI
                </button>
              </div>
            ))}
          </div>

          <div className="p-16 bg-dark border border-white/5 flex flex-col items-center text-center shadow-2xl">
             <div className="w-20 h-20 border border-white/5 flex items-center justify-center mb-10 relative bg-black/40">
               <Shield className="w-10 h-10 text-white/20" />
               <div className="absolute inset-0 bg-primary/5 animate-pulse" />
             </div>
             <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-5">AI Legal Guard</h3>
             <p className="text-sm font-sans text-white/30 max-w-xl mb-12 italic font-medium leading-relaxed">Our AI scans every draft for predatory clauses and royalty caps to ensure your rights are always protected.</p>
             <button className="primary-button px-16 h-16 text-sm">Run Legal Audit</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
