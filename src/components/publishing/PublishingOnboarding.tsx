import { useNavigate } from 'react-router-dom';
import { FileText, ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react';

export default function PublishingOnboarding() {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-8">
      {/* Hero */}
      <div className="text-center space-y-6 pb-8 border-b border-[var(--border-main)]">
        <div className="flex items-center justify-center gap-2 text-[#F05A28] mb-4">
          <FileText className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-widest uppercase font-mono">PUBLISHING ADMINISTRATION</span>
        </div>
        <h1 className="text-4xl font-black text-[var(--text-main)] uppercase font-mono tracking-tight">
          Would you like to use our publishing services?
        </h1>
        <p className="text-sm text-[#8A8A93] max-w-2xl mx-auto leading-relaxed">
          With our state-of-the-art publishing administration system, both writers and publishers can start collecting their royalties globally.
        </p>
        <p className="text-xs text-[#6A6A75] italic max-w-xl mx-auto">
          By registering your songs and writer's information, you can now collect public performance and mechanical royalties from PRO's, CMO's, and DSP's around the world.
        </p>
      </div>

      {/* Eligibility Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: FileText,
            title: 'Original Content',
            desc: 'You can only register songs written or published by you.',
            color: 'text-blue-600',
            bg: 'bg-blue-500/10 border-blue-200',
          },
          {
            icon: ShieldCheck,
            title: 'PRO Affiliation / IPI',
            desc: 'You should be currently affiliated with a Performing Rights Organization (PRO) and have a valid IPI number.',
            color: 'text-emerald-600',
            bg: 'bg-emerald-500/10 border-emerald-200',
          },
          {
            icon: TrendingUp,
            title: 'DSP Traction',
            desc: 'Only songs with traction on DSPs will be allowed.',
            color: 'text-purple-600',
            bg: 'bg-purple-500/10 border-purple-200',
          },
        ].map((pillar) => (
          <div key={pillar.title} className={`${pillar.bg} border p-8 text-center space-y-5`}>
            <div className={`w-14 h-14 mx-auto border ${pillar.bg} flex items-center justify-center`}>
              <pillar.icon className={`w-6 h-6 ${pillar.color}`} />
            </div>
            <h3 className="text-sm font-black text-[#C9C9CF] uppercase font-mono tracking-tight">{pillar.title}</h3>
            <p className="text-[10px] text-[#8A8A93] font-mono leading-relaxed">{pillar.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center pt-8">
        <button
          onClick={() => navigate('/publishing/shares')}
          className="inline-flex items-center gap-3 px-12 py-5 bg-[#F05A28] text-white text-xs font-black uppercase tracking-widest font-mono italic hover:bg-[#d94d20] transition-all"
        >
          <FileText className="w-5 h-5" />
          JOIN ONE PUBLISHING
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
