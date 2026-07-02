import { useNavigate } from 'react-router-dom';
import {
  Megaphone,
  Upload,
  Video,
  FileText,
  Youtube,
  Music,
  ShieldCheck,
  HeadphonesIcon,
  BarChart3,
  Users,
} from 'lucide-react';

interface QuickAction {
  icon: typeof Megaphone;
  label: string;
  path: string;
  description: string;
}

const actions: QuickAction[] = [
  { icon: Megaphone, label: 'AMPLIFIER', path: '/campaigns/new', description: 'Launch marketing campaigns' },
  { icon: Upload, label: 'UPLOAD MUSIC', path: '/releases/new', description: 'Ingest new track' },
  { icon: Video, label: 'DISTRIBUTE VIDEO', path: '/video/distribute', description: 'Video delivery wizard' },
  { icon: FileText, label: 'REGISTER COMPOSITIONS', path: '/publishing', description: 'Rights & licensing' },
  { icon: Youtube, label: 'JOIN YOUTUBE NETWORK', path: '/settings', description: 'Content ID monetization' },
  { icon: Music, label: 'SPOTIFY FOR ARTISTS', path: '/settings', description: 'DSP profile verification' },
  { icon: ShieldCheck, label: 'APPLE FOR ARTISTS', path: '/settings', description: 'Apple Music verification' },
  { icon: HeadphonesIcon, label: 'SUPPORT TICKETS', path: '#', description: 'Customer success' },
];

export default function QuickActionGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => navigate(action.path)}
          className="beam bg-white border border-gray-200 transition-all p-6 flex flex-col items-center justify-center gap-4 group text-center"
        >
          <div className="w-12 h-12 border border-gray-200 flex items-center justify-center transition-all">
            <action.icon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest font-mono block transition-colors">
              {action.label}
            </span>
            <span className="text-[8px] text-gray-400 font-mono mt-1 block">
              {action.description}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
