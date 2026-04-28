import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Disc,
  Wallet,
  Users,
  PlusCircle,
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
  ArrowLeftRight,
  X,
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

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const location = useLocation();
  const { role } = useTheme();

  const navItems = role === 'ARTIST' ? artistNav : role === 'INFLUENCER' ? influencerNav : djNav;

  const resetPortal = () => {
    localStorage.removeItem('dropkast_welcome_seen');
    window.location.reload();
  };

  return (
    <aside
      className={cn(
        'w-72 max-w-[85vw] md:w-56 h-screen bg-[var(--bg-main)] border-r border-[var(--border-main)] flex flex-col z-40 backdrop-blur-md transition-transform duration-300 ease-out',
        // Mobile: fixed off-canvas drawer
        'fixed top-0 left-0 md:relative md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}
    >
      {/* Logo + mobile close */}
      <div className="px-5 py-4 border-b border-[var(--border-main)] shrink-0 flex items-center justify-between">
        <Link to="/dashboard" className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-white leading-none font-mono italic uppercase">
              DROPKAST
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
          <span className="text-[8px] font-medium text-white/30 uppercase tracking-[0.2em]">
            Next-Gen Distribution
          </span>
        </Link>
        <button
          onClick={onClose}
          className="md:hidden p-2 -mr-2 text-white/40 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Pinned New Release CTA — only for artists */}
      {role === 'ARTIST' && (
        <div className="px-3 pt-3 pb-2 shrink-0">
          <Link
            to="/releases/new"
            className="flex items-center justify-between w-full bg-white text-black font-mono font-black uppercase text-[10px] tracking-widest px-4 py-2.5 hover:bg-primary hover:text-white transition-all group active:scale-95"
          >
            <span>NEW_RELEASE</span>
            <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          </Link>
        </div>
      )}

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar min-h-0 py-2 overscroll-contain">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-5 md:px-5 py-2.5 transition-all group relative',
                isActive
                  ? 'bg-primary/5 text-primary'
                  : 'text-[var(--text-main)]/40 hover:bg-[var(--text-main)]/[0.02] hover:text-[var(--text-main)]',
              )}
            >
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
              <span
                className={cn(
                  'text-[10px] font-mono font-bold tracking-widest',
                  isActive ? 'text-primary' : 'text-white/10',
                )}
              >
                {item.id}
              </span>
              <item.icon
                className={cn(
                  'w-4 h-4 transition-transform shrink-0',
                  isActive ? 'text-primary scale-110' : 'text-white/20 group-hover:scale-110',
                )}
              />
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[var(--border-main)] shrink-0 flex flex-col gap-2">
        <div className="flex items-center gap-3 text-white/20">
          <Lock className="w-3 h-3" />
          <span className="text-[9px] font-medium uppercase tracking-widest">Safe & Secure</span>
        </div>
        <button
          onClick={resetPortal}
          className="flex items-center justify-center gap-3 w-full h-10 border border-white/5 text-white/20 hover:text-primary hover:border-primary transition-all font-mono font-bold text-[9px] uppercase tracking-widest"
        >
          <ArrowLeftRight className="w-3 h-3" />
          <span>PORTAL_REBOOT</span>
        </button>
      </div>
    </aside>
  );
}
