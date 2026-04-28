import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Music, 
  LayoutDashboard, 
  Disc, 
  BarChart3, 
  Wallet, 
  Users, 
  PlusCircle,
  Globe2,
  Lock,
  Megaphone,
  TrendingUp,
  Cpu,
  Camera,
  Target,
  Zap,
  Radio,
  Share2,
  FileText,
  MessageSquare,
  BarChart,
  Package,
  Video,
  CreditCard,
  ArrowLeftRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

const artistNav = [
  { id: '01', icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { id: '02', icon: Megaphone, label: 'Pre-Release', path: '/pre-release' },
  { id: '03', icon: Target, label: 'Campaigns', path: '/campaigns' },
  { id: '04', icon: Users, label: 'Influencers', path: '/influencers' },
  { id: '05', icon: Package, label: 'Promo Packs', path: '/promo' },
  { id: '06', icon: Video, label: 'UGC Studio', path: '/ugc' },
  { id: '07', icon: Radio, label: 'DJ Packs', path: '/djs' },
  { id: '08', icon: Zap, label: 'Reactions', path: '/reactions' },
  { id: '09', icon: Share2, label: 'Social Ads', path: '/social' },
  { id: '10', icon: FileText, label: 'Split Sheets', path: '/splits' },
  { id: '11', icon: MessageSquare, label: 'A&R Feedback', path: '/anr' },
  { id: '12', icon: BarChart, label: 'Analytics', path: '/analytics' },
  { id: '13', icon: Wallet, label: 'Treasury', path: '/earnings' },
  { id: '14', icon: Camera, label: 'Assets', path: '/assets' },
  { id: '15', icon: Cpu, label: 'Settings', path: '/settings' },
];

const influencerNav = [
  { id: 'i1', icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { id: 'i2', icon: Target, label: 'Missions', path: '/influencer/missions' },
  { id: 'i3', icon: CreditCard, label: 'Earnings', path: '/influencer/earnings' },
  { id: 'i4', icon: Share2, label: 'Social Nodes', path: '/influencer/socials' },
  { id: 'i5', icon: Cpu, label: 'Settings', path: '/settings' },
];

const djNav = [
  { id: 'd1', icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { id: 'd2', icon: Disc, label: 'DJ Packs', path: '/dj/packs' },
  { id: 'd3', icon: MessageSquare, label: 'A&R Intel', path: '/dj/feedback' },
  { id: 'd4', icon: TrendingUp, label: 'Charts', path: '/analytics' },
  { id: 'd5', icon: Cpu, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useTheme();

  const navItems = role === 'ARTIST' ? artistNav : (role === 'INFLUENCER' ? influencerNav : djNav);

  const resetPortal = () => {
    localStorage.removeItem('dropkast_welcome_seen');
    window.location.reload();
  };

  return (
    <aside className="w-60 bg-[var(--bg-main)] border-r border-[var(--border-main)] flex flex-col z-20 backdrop-blur-md">
      <div className="p-6 pb-8 border-b border-[var(--border-main)]">
        <Link to="/dashboard" className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-white leading-none font-mono italic uppercase">DROPKAST</span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
          </div>
          <span className="text-[8px] font-medium text-white/30 uppercase tracking-[0.2em]">Next-Gen Distribution</span>
        </Link>
      </div>

      <nav className="flex-1 mt-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-8 py-4.5 transition-all group relative",
                isActive 
                  ? "bg-primary/5 text-primary" 
                  : "text-[var(--text-main)]/40 hover:bg-[var(--text-main)]/[0.02] hover:text-[var(--text-main)]"
              )}
            >
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
              <span className={cn(
                "text-[10px] font-mono font-bold tracking-widest",
                isActive ? "text-primary" : "text-white/10"
              )}>{item.id}</span>
              <item.icon className={cn(
                "w-4 h-4 transition-transform",
                isActive ? "text-primary scale-110" : "text-white/20 group-hover:scale-110"
              )} />
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-8 flex flex-col gap-6">
        <Link 
          to="/releases/new"
          className="flex items-center justify-between w-full bg-white text-black font-mono font-black uppercase text-[10px] tracking-widest px-6 py-4 hover:bg-primary hover:text-white transition-all group active:scale-95"
        >
          <span>NEW_RELEASE</span>
          <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" />
        </Link>
        <div className="flex items-center gap-3 text-white/20">
          <Lock className="w-3 h-3" />
          <span className="text-[9px] font-medium uppercase tracking-widest">Safe & Secure</span>
        </div>

        <button 
          onClick={resetPortal}
          className="flex items-center justify-center gap-4 w-full h-12 border border-white/5 text-white/20 hover:text-primary hover:border-primary transition-all font-mono font-bold text-[9px] uppercase tracking-widest mt-4"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>PORTAL_REBOOT</span>
        </button>
      </div>
    </aside>
  );
}

function Barcode({ sim }: { sim?: boolean }) {
  return (
    <div className={cn("h-6 w-16 opacity-20", sim && "barcode-sim")} />
  );
}
