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
  Flame,
  X,
  ChevronDown,
  ChevronRight,
  Globe,
  Newspaper,
  GraduationCap,
  ExternalLink,
  Headphones,
  Music,
  Youtube,
  Settings,
  Download,
  Image,
  Send,
  List,
  PieChart,
  type LucideProps,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PRESETS, type ModuleId, type WorkspacePreset } from '../../lib/workspace';
import { toast } from 'sonner';
import { useState, type FC } from 'react';

interface NavItem {
  icon: any;
  label: string;
  path: string;
  moduleId: ModuleId;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

interface TreeSection {
  label: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  defaultOpen?: boolean;
  children: {
    label: string;
    path: string;
    icon?: any;
    children?: { label: string; path: string }[];
  }[];
}

const treeSections: TreeSection[] = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    defaultOpen: true,
    children: [{ label: 'Home', path: '/dashboard' }],
  },
  {
    label: 'Distribution Tools',
    icon: Disc,
    children: [
      { label: 'Manage Music', path: '/releases' },
      { label: 'Upload Music', path: '/releases/new' },
      { label: 'Manage Video', path: '/releases?tab=video' },
      { label: 'Upload Video', path: '/video/distribute' },
    ],
  },
  {
    label: 'Publishing Hub',
    icon: FileText,
    badge: 'NEW',
    children: [
      { label: 'Manage Compositions', path: '/publishing' },
      { label: 'Add Composition', path: '/publishing' },
      { label: 'Rights Owners Info', path: '/publishing' },
      { label: 'Publishing Analytics', path: '/analytics' },
      { label: 'Share Requests', path: '/publishing/shares' },
    ],
  },
  {
    label: 'Daily Trends',
    icon: TrendingUp,
    children: [
      { label: 'Daily Stats', path: '/trending', icon: BarChart },
      { label: 'Demographics', path: '/analytics/audience', icon: PieChart },
      { label: 'TikTok Stats', path: '/trending', icon: Video },
      { label: 'Store Comparison', path: '/analytics', icon: Building2 },
      { label: 'Music Charts', path: '/analytics/charts', icon: Music },
      { label: 'Trackers', path: '/analytics', icon: Target },
    ],
  },
  {
    label: 'Marketing Engine',
    icon: Megaphone,
    badge: 'NEW',
    children: [
      { label: 'Amplifier Engine', path: '/campaigns' },
      {
        label: 'Promotional Tools',
        icon: Sparkles,
        path: '/promo',
      },
      {
        label: 'DSP Account Sync',
        icon: Globe,
        path: '#',
        children: [
          { label: 'Spotify for Artists', path: '/settings' },
          { label: 'YouTube Official Artist Channel', path: '/settings' },
          { label: 'Apple for Artists', path: '/settings' },
          { label: 'Audiomack Artist Account', path: '/settings' },
        ],
      },
    ],
  },
  {
    label: 'Monthly Analytics & Accounting',
    icon: Wallet,
    children: [
      { label: 'Monthly Analytics', path: '/analytics' },
      { label: 'Accounting', path: '/earnings' },
    ],
  },
  {
    label: 'Support Workspace',
    icon: Headphones,
    children: [
      { label: 'Support Tickets', path: '#' },
    ],
  },
  {
    label: 'Account Settings',
    icon: Settings,
    children: [
      { label: 'Payoneer Setup', path: '/settings' },
      { label: 'Join YouTube Network', path: '/settings' },
      { label: 'My Backups', path: '/settings' },
    ],
  },
  {
    label: 'Update Password',
    icon: Lock,
    children: [{ label: 'Change Password', path: '/settings' }],
  },
  {
    label: 'ONE Community',
    icon: Globe,
    badge: 'NEW',
    badgeColor: 'bg-[#F05A28]',
    children: [
      { label: 'Academy', path: '/academy' },
      { label: 'Product Roadmap', path: '/roadmap' },
      { label: 'Latest Releases', path: '/releases' },
    ],
  },
];

/** Legacy nav groups — used by workspace preset system for compatibility. */
const artistNavGroups: NavGroup[] = [
  {
    items: [
      { icon: LayoutDashboard, label: 'Home', path: '/dashboard', moduleId: 'home' },
      { icon: Mail, label: 'Messages', path: '/messages', moduleId: 'messages' },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { icon: Megaphone, label: 'Pre-Release', path: '/pre-release', moduleId: 'pre-release' },
      { icon: Link2, label: 'Smart Links', path: '/links', moduleId: 'smart-links' },
      { icon: Camera, label: 'Assets', path: '/assets', moduleId: 'assets' },
    ],
  },
  {
    label: 'Promote',
    items: [
      { icon: Target, label: 'Campaigns', path: '/campaigns', moduleId: 'campaigns' },
      { icon: Users, label: 'Influencers', path: '/influencers', moduleId: 'influencers' },
      { icon: Radio, label: 'DJ Packs', path: '/djs', moduleId: 'dj-packs' },
      { icon: Zap, label: 'Reactions', path: '/reactions', moduleId: 'reactions' },
      { icon: Share2, label: 'Social Ads', path: '/social', moduleId: 'social-ads' },
    ],
  },
  {
    label: 'Money',
    items: [
      { icon: BarChart, label: 'Analytics', path: '/analytics', moduleId: 'analytics' },
      { icon: Wallet, label: 'Earnings', path: '/earnings', moduleId: 'earnings' },
      { icon: Sparkles, label: 'Advances', path: '/advances', moduleId: 'advances' },
      { icon: FileText, label: 'Split Sheets', path: '/splits', moduleId: 'splits' },
    ],
  },
  {
    label: 'Setup',
    items: [
      { icon: Cpu, label: 'Connectors', path: '/ai-providers', moduleId: 'ai-providers' },
      { icon: Building2, label: 'Admin', path: '/admin', moduleId: 'admin' },
      { icon: Cpu, label: 'Settings', path: '/settings', moduleId: 'settings' },
    ],
  },
];

/** Flat list (used by ARTIST + LABEL roles). Items shown depend on workspace toggles. */
const artistNav: NavItem[] = artistNavGroups.flatMap((g) => g.items);

const influencerNav = [
  { id: 'i1', icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { id: 'i2', icon: Mail, label: 'Messages', path: '/messages' },
  { id: 'i3', icon: Target, label: 'Missions', path: '/influencer/missions' },
  { id: 'i4', icon: CreditCard, label: 'Earnings', path: '/influencer/earnings' },
  { id: 'i5', icon: Share2, label: 'Social Nodes', path: '/influencer/socials' },
  { id: 'i6', icon: Sparkles, label: 'Connectors', path: '/ai-providers' },
  { id: 'i7', icon: Cpu, label: 'Settings', path: '/settings' },
];

const djNav = [
  { id: 'd1', icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { id: 'd2', icon: Mail, label: 'Messages', path: '/messages' },
  { id: 'd3', icon: Disc, label: 'DJ Packs', path: '/dj/packs' },
  { id: 'd4', icon: MessageSquare, label: 'A&R Intel', path: '/dj/feedback' },
  { id: 'd5', icon: TrendingUp, label: 'Charts', path: '/analytics' },
  { id: 'd6', icon: Sparkles, label: 'Connectors', path: '/ai-providers' },
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
  '/djs': 'nav-djs',
  '/reactions': 'nav-reactions',
  '/social': 'nav-social',
  '/splits': 'nav-splits',
  '/analytics': 'nav-analytics',
  '/earnings': 'nav-earnings',
  '/assets': 'nav-assets',
  '/ai-providers': 'nav-ai-providers',
  '/settings': 'nav-settings',
  '/influencer/missions': 'nav-missions',
  '/influencer/earnings': 'nav-influencer-earnings',
  '/dj/packs': 'nav-djpacks',
  '/dj/feedback': 'nav-djfeedback',
  '/publishing': 'nav-publishing',
  '/publishing/shares': 'nav-publishing-shares',
  '/video/distribute': 'nav-video-distribute',
  '/promo': 'nav-promo-tools',
  '/trending': 'nav-trending',
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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    treeSections.forEach((s) => {
      initial[s.label] = s.defaultOpen ?? false;
    });
    return initial;
  });

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isChildActive = (children: { label: string; path: string }[]): boolean => {
    return children.some((c) => location.pathname === c.path);
  };

  // For artist/label, render grouped. Filter items by enabled workspace modules.
  // The Roster item is special — only on label, always pinned at the top.
  const showsGroups = role === 'ARTIST' || role === 'LABEL';

  const groupsForRender: NavGroup[] = showsGroups
    ? artistNavGroups
        .map((g) => ({
          ...g,
          items: g.items.filter((item) => isEnabled(item.moduleId)),
        }))
        .filter((g) => g.items.length > 0)
    : [];

  const flatItems = role === 'INFLUENCER' ? influencerNav : role === 'DJ' ? djNav : [];

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
          className="md:hidden p-4 -mr-4 text-white/40 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
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

      {/* Scrollable nav — Tree structure for ARTIST/LABEL */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar min-h-0 py-2 overscroll-contain">
        {showsGroups ? (
          <div className="space-y-0.5">
            {treeSections.map((section) => {
              const isOpen = openSections[section.label] ?? false;
              const hasActiveChild = isChildActive(section.children);
              const isActive = section.children.some((c) => location.pathname === c.path) || hasActiveChild;

              return (
                <div key={section.label}>
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.label)}
                    className={cn(
                      'w-full flex items-center gap-3 px-5 py-2.5 transition-all group text-left',
                      isActive
                        ? 'text-primary bg-primary/5'
                        : 'text-white/40 hover:text-white hover:bg-white/[0.02]',
                    )}
                  >
                    <section.icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-[10px] font-bold uppercase tracking-widest font-mono leading-none">
                      {section.label}
                    </span>
                    {section.badge && (
                      <span className={cn(
                        'px-2 py-0.5 text-[7px] font-black uppercase tracking-widest text-white',
                        section.badgeColor || 'bg-primary',
                      )}>
                        {section.badge}
                      </span>
                    )}
                    {isOpen ? (
                      <ChevronDown className="w-3 h-3 text-white/20" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-white/20" />
                    )}
                  </button>

                  {/* Children */}
                  {isOpen && (
                    <div className="ml-3 border-l border-white/5 pl-3">
                      {section.children.map((child) => {
                        if (child.children) {
                          return (
                            <NestedTreeItem
                              key={child.label}
                              label={child.label}
                              icon={child.icon}
                              items={child.children.map((c) => ({
                                label: c.label,
                                path: c.path,
                              }))}
                              location={location}
                            />
                          );
                        }
                        return (
                          <Link
                            key={child.label}
                            to={child.path}
                            className={cn(
                              'flex items-center gap-3 px-4 py-2 text-[9px] font-bold uppercase tracking-widest font-mono transition-all',
                              location.pathname === child.path
                                ? 'text-primary bg-primary/5'
                                : 'text-white/30 hover:text-white hover:bg-white/[0.02]',
                            )}
                          >
                            {child.icon && <child.icon className="w-3 h-3 shrink-0" />}
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          flatItems.map((item: any) => (
            <NavLinkRow
              key={item.path}
              item={{ ...item, moduleId: 'home' as ModuleId }}
              active={location.pathname === item.path}
            />
          ))
        )}
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
 * NavLinkRow — single sidebar entry, used by both grouped and flat layouts
 * ========================================================================= */
function NavLinkRow({ item, active }: { item: NavItem; active: boolean }) {
  const tourId = TOUR_TARGETS[item.path];
  return (
    <Link
      to={item.path}
      data-tour={tourId}
      className={cn(
        'flex items-center gap-3 px-5 py-2 transition-all group relative',
        active
          ? 'bg-primary/5 text-primary'
          : 'text-[var(--text-main)]/40 hover:bg-[var(--text-main)]/[0.02] hover:text-[var(--text-main)]',
      )}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
      <item.icon
        className={cn(
          'w-4 h-4 transition-transform shrink-0',
          active ? 'text-primary scale-110' : 'text-white/30 group-hover:scale-110',
        )}
      />
      <span className="text-[11px] font-mono font-bold uppercase tracking-widest leading-none">
        {item.label}
      </span>
    </Link>
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

/* =========================================================================
 * NestedTreeItem — collapsible sub-group within a sidebar tree section
 * ========================================================================= */
function NestedTreeItem({
  label,
  icon: Icon,
  items,
  location,
}: {
  label: string;
  icon?: any;
  items: { label: string; path: string }[];
  location: any;
}) {
  const [open, setOpen] = useState(false);
  const hasActive = items.some((c) => location.pathname === c.path);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-2 text-[9px] font-bold uppercase tracking-widest font-mono transition-all',
          hasActive ? 'text-primary' : 'text-white/30 hover:text-white',
        )}
      >
        {Icon && <Icon className="w-3 h-3 shrink-0" />}
        <span className="flex-1 text-left">{label}</span>
        {open ? (
          <ChevronDown className="w-2.5 h-2.5 text-white/20" />
        ) : (
          <ChevronRight className="w-2.5 h-2.5 text-white/20" />
        )}
      </button>
      {open && (
        <div className="ml-4 border-l border-white/5 pl-2">
          {items.map((child) => (
            <Link
              key={child.path}
              to={child.path}
              className={cn(
                'block px-4 py-1.5 text-[8px] font-bold uppercase tracking-widest font-mono transition-all',
                location.pathname === child.path
                  ? 'text-primary'
                  : 'text-white/20 hover:text-white/60',
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
