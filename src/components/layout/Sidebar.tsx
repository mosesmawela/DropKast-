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
  Sparkles,
  Mail,
  Building2,
  Link2,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PRESETS, type ModuleId, type WorkspacePreset } from '../../lib/workspace';
import { toast } from 'sonner';

const artistNav: Array<{ id: string; icon: any; label: string; path: string; moduleId: ModuleId }> = [
  { id: '01', icon: LayoutDashboard, label: 'Home',         path: '/dashboard',     moduleId: 'home' },
  { id: '02', icon: Mail,            label: 'Messages',     path: '/messages',      moduleId: 'messages' },
  { id: '03', icon: Megaphone,       label: 'Pre-Release',  path: '/pre-release',   moduleId: 'pre-release' },
  { id: '04', icon: Target,          label: 'Campaigns',    path: '/campaigns',     moduleId: 'campaigns' },
  { id: '05', icon: Users,           label: 'Influencers',  path: '/influencers',   moduleId: 'influencers' },
  { id: '06', icon: Package,         label: 'Promo Packs',  path: '/promo',         moduleId: 'promo-packs' },
  { id: '07', icon: Video,           label: 'UGC Studio',   path: '/ugc',           moduleId: 'ugc-studio' },
  { id: '08', icon: Radio,           label: 'DJ Packs',     path: '/djs',           moduleId: 'dj-packs' },
  { id: '09', icon: Zap,             label: 'Reactions',    path: '/reactions',     moduleId: 'reactions' },
  { id: '10', icon: Share2,          label: 'Social Ads',   path: '/social',        moduleId: 'social-ads' },
  { id: '11', icon: FileText,        label: 'Split Sheets', path: '/splits',        moduleId: 'splits' },
  { id: '12', icon: MessageSquare,   label: 'A&R Feedback', path: '/anr',           moduleId: 'anr' },
  { id: '13', icon: BarChart,        label: 'Analytics',    path: '/analytics',     moduleId: 'analytics' },
  { id: '14', icon: Wallet,          label: 'Earnings',     path: '/earnings',      moduleId: 'earnings' },
  { id: '14b', icon: Sparkles,       label: 'Advances',     path: '/advances',      moduleId: 'advances' },
  { id: '15', icon: Camera,          label: 'Assets',       path: '/assets',        moduleId: 'assets' },
  { id: '15b', icon: Link2,          label: 'Smart Links',  path: '/links',         moduleId: 'smart-links' },
  { id: '15c', icon: Sparkles,       label: 'Studios',      path: '/studios',       moduleId: 'studios' },
  { id: '16', icon: Sparkles,        label: 'AI Models',    path: '/ai-providers',  moduleId: 'ai-providers' },
  { id: '17', icon: Cpu,             label: 'Settings',     path: '/settings',      moduleId: 'settings' },
];

const influencerNav = [
  { id: 'i1', icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { id: 'i2', icon: Mail, label: 'Messages', path: '/messages' },
  { id: 'i3', icon: Target, label: 'Missions', path: '/influencer/missions' },
  { id: 'i4', icon: CreditCard, label: 'Earnings', path: '/influencer/earnings' },
  { id: 'i5', icon: Share2, label: 'Social Nodes', path: '/influencer/socials' },
  { id: 'i6', icon: Sparkles, label: 'AI Models', path: '/ai-providers' },
  { id: 'i7', icon: Cpu, label: 'Settings', path: '/settings' },
];

const djNav = [
  { id: 'd1', icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { id: 'd2', icon: Mail, label: 'Messages', path: '/messages' },
  { id: 'd3', icon: Disc, label: 'DJ Packs', path: '/dj/packs' },
  { id: 'd4', icon: MessageSquare, label: 'A&R Intel', path: '/dj/feedback' },
  { id: 'd5', icon: TrendingUp, label: 'Charts', path: '/analytics' },
  { id: 'd6', icon: Sparkles, label: 'AI Models', path: '/ai-providers' },
  { id: 'd7', icon: Cpu, label: 'Settings', path: '/settings' },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const TOUR_TARGETS: Record<string, string | undefined> = {
  '/dashboard': 'nav-dashboard',
  '/messages': 'nav-messages',
  '/pre-release': 'nav-prerelease',
  '/campaigns': 'nav-campaigns',
  '/influencers': 'nav-influencers',
  '/promo': 'nav-promo',
  '/ugc': 'nav-ugc',
  '/djs': 'nav-djs',
  '/reactions': 'nav-reactions',
  '/social': 'nav-social',
  '/splits': 'nav-splits',
  '/anr': 'nav-anr',
  '/analytics': 'nav-analytics',
  '/earnings': 'nav-earnings',
  '/assets': 'nav-assets',
  '/ai-providers': 'nav-ai-providers',
  '/settings': 'nav-settings',
  '/influencer/missions': 'nav-missions',
  '/influencer/earnings': 'nav-influencer-earnings',
  '/dj/packs': 'nav-djpacks',
  '/dj/feedback': 'nav-djfeedback',
};

/** Detect which preset (if any) the current enabled-module set matches exactly. */
function detectActivePreset(enabled: Set<ModuleId>): WorkspacePreset | 'custom' {
  const presetKeys: WorkspacePreset[] = ['minimal', 'creator', 'full'];
  for (const key of presetKeys) {
    const presetModules = new Set(PRESETS[key].modules);
    if (presetModules.size !== enabled.size) continue;
    let match = true;
    for (const id of presetModules) {
      if (!enabled.has(id)) { match = false; break; }
    }
    if (match) return key;
  }
  return 'custom';
}

const PRESET_BUTTONS: Array<{ id: WorkspacePreset; short: string; label: string }> = [
  { id: 'minimal', short: 'Min',     label: 'Minimal' },
  { id: 'creator', short: 'Creator', label: 'Creator' },
  { id: 'full',    short: 'Full',    label: 'Full' },
];

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const location = useLocation();
  const { role } = useTheme();
  const { enabled, isEnabled, setPreset } = useWorkspace();
  const activePreset = detectActivePreset(enabled);

  const labelNav: typeof artistNav = [
    { id: '00', icon: Building2, label: 'Roster', path: '/roster', moduleId: 'home' },
    ...artistNav,
  ];

  const baseNav =
    role === 'LABEL'
      ? labelNav
      : role === 'ARTIST'
      ? artistNav
      : role === 'INFLUENCER'
      ? influencerNav
      : djNav;

  // For artists & labels, hide modules disabled in their workspace.
  // The Roster item (only on labels) bypasses the module filter — it's always shown.
  const navItems =
    role === 'ARTIST' || role === 'LABEL'
      ? (baseNav as typeof artistNav).filter(
          (item) => item.path === '/roster' || isEnabled(item.moduleId),
        )
      : baseNav;

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
      <div className="px-5 py-4 border-b border-[var(--border-main)] shrink-0 flex items-center justify-between" data-tour="sidebar-logo">
        <Link to="/dashboard" className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-white leading-none font-mono italic uppercase">
              DROPKAST
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
          <span className="text-[8px] font-medium text-white/30 uppercase tracking-[0.2em]">
            Music distribution
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
            data-tour="new-release"
            className="flex items-center justify-between w-full bg-white text-black font-mono font-black uppercase text-[10px] tracking-widest px-4 py-2.5 hover:bg-primary hover:text-white transition-all group active:scale-95"
          >
            <span>New Release</span>
            <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          </Link>
        </div>
      )}

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar min-h-0 py-2 overscroll-contain">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const tourId = TOUR_TARGETS[item.path];
          return (
            <Link
              key={item.path}
              to={item.path}
              data-tour={tourId}
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
      <div className="px-3 py-3 border-t border-[var(--border-main)] shrink-0 flex flex-col gap-2.5">
        {/* Quick preset switcher — only for artist/label workspaces */}
        {(role === 'ARTIST' || role === 'LABEL') && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[8px] font-mono font-black text-white/30 tracking-[0.3em] uppercase italic">
                Workspace
              </span>
              <span className="text-[8px] font-mono font-black text-primary tracking-[0.2em] uppercase italic">
                {activePreset === 'custom' ? 'Custom' : PRESETS[activePreset].label}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {PRESET_BUTTONS.map((p) => {
                const isActive = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPreset(p.id);
                      toast.success(`Switched to ${PRESETS[p.id].label}`, {
                        description: `${PRESETS[p.id].modules.length} modules enabled`,
                      });
                    }}
                    title={`${PRESETS[p.id].label} — ${PRESETS[p.id].description}`}
                    className={cn(
                      'h-9 text-[9px] font-mono font-black uppercase tracking-widest italic transition-all relative overflow-hidden',
                      isActive
                        ? 'bg-primary text-white preset-glow'
                        : 'border border-white/10 text-white/40 hover:border-primary hover:text-white',
                    )}
                  >
                    {p.short}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Plan badge — links to /subscription. Shows current tier + upgrade hint when on free. */}
        <PlanBadge />

        {/* Home shortcut (replaces useless Switch Portal) */}
        <Link
          to="/dashboard"
          className="flex items-center justify-center gap-2 w-full h-9 border border-white/5 text-white/30 hover:text-primary hover:border-primary transition-all font-mono font-black text-[9px] uppercase tracking-widest italic"
        >
          <LayoutDashboard className="w-3 h-3" />
          <span>Home</span>
        </Link>

        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-1.5 text-white/15">
            <Lock className="w-2.5 h-2.5" />
            <span className="text-[8px] font-medium uppercase tracking-widest">Encrypted</span>
          </div>
          <button
            onClick={resetPortal}
            className="text-white/15 hover:text-white/40 transition-colors text-[8px] font-mono font-black uppercase tracking-widest italic"
            title="Switch portal"
          >
            <ArrowLeftRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* =========================================================================
 * Plan badge — bottom-of-sidebar shortcut to /subscription with tier hint
 * ========================================================================= */
function PlanBadge() {
  // Dynamic import to avoid hard cycle if SubscriptionContext isn't mounted yet
  let tierName = 'Free';
  let isPaid = false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useSubscription } = require('../../context/SubscriptionContext');
    const sub = useSubscription();
    tierName = sub.tier.name;
    isPaid = sub.isPaid;
  } catch {/* SubscriptionProvider not mounted — render Free state */}

  return (
    <Link
      to="/subscription"
      className={cn(
        'flex items-center justify-between gap-2 w-full h-9 px-3 transition-all font-mono font-black text-[9px] uppercase tracking-widest italic',
        isPaid
          ? 'bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20'
          : 'border border-white/5 text-white/30 hover:border-primary hover:text-primary',
      )}
    >
      <span className="flex items-center gap-1.5">
        <Sparkles className="w-3 h-3" />
        {tierName}
      </span>
      {!isPaid && <span className="text-primary">Upgrade →</span>}
    </Link>
  );
}
