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
  Plug,
  PanelLeftClose,
  PanelLeft,
  type LucideProps,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { PRESETS, MODULES, type ModuleId, type WorkspacePreset } from '../../lib/workspace';
import { toast } from 'sonner';
import { useState, useEffect, useRef, useCallback, type FC } from 'react';

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
  /** When set (and no children), the section is a single direct link — no dropdown. */
  path?: string;
  children?: {
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
      { label: 'Video Distribution', path: '/video/distribute' },
    ],
  },
  {
    label: 'Publishing Hub',
    icon: FileText,
    children: [
      { label: 'Compositions', path: '/publishing' },
      { label: 'Share Requests', path: '/publishing/shares' },
    ],
  },
  {
    label: 'Daily Trends',
    icon: TrendingUp,
    children: [
      { label: 'Daily Stats', path: '/trending', icon: BarChart },
      { label: 'Audience', path: '/analytics/audience', icon: PieChart },
      { label: 'Music Charts', path: '/analytics/charts', icon: Music },
    ],
  },
  {
    label: 'Marketing Engine',
    icon: Megaphone,
    children: [
      { label: 'Amplifier Engine', path: '/campaigns' },
      { label: 'AI Studio', path: '/studio', icon: Sparkles },
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
          { label: 'Spotify for Artists', path: 'https://artists.spotify.com' },
          { label: 'YouTube Official Artist Channel', path: 'https://artists.youtube.com' },
          { label: 'Apple for Artists', path: 'https://artists.apple.com' },
          { label: 'Audiomack Artist Account', path: 'https://artists.audiomack.com' },
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
    label: 'Connectors',
    icon: Plug,
    path: '/ai-providers',
  },
  {
    label: 'Help & Support',
    icon: Headphones,
    children: [
      { label: 'Academy & Guides', path: '/academy' },
    ],
  },
  {
    label: 'Account Settings',
    icon: Settings,
    path: '/settings',
  },
];

/* Dedicated navigation per portal — same accordion style, portal-specific
   operations, so every portal is consistent yet purpose-built. */
const labelTree: TreeSection[] = [
  { label: 'Label HQ', icon: LayoutDashboard, defaultOpen: true, children: [{ label: 'Overview', path: '/dashboard' }] },
  { label: 'Roster', icon: Users, defaultOpen: true, children: [
    { label: 'Manage Artists', path: '/roster' },
  ] },
  { label: 'Catalogue', icon: Disc, children: [
    { label: 'All Releases', path: '/releases' },
    { label: 'New Release', path: '/releases/new' },
    { label: 'Publishing', path: '/publishing' },
  ] },
  { label: 'Marketing', icon: Megaphone, children: [
    { label: 'Campaigns', path: '/campaigns' },
    { label: 'AI Studio', path: '/studio' },
    { label: 'Pre-Release', path: '/pre-release' },
  ] },
  { label: 'Reporting', icon: BarChart, children: [
    { label: 'Catalogue Analytics', path: '/analytics' },
    { label: 'Label Earnings', path: '/earnings' },
    { label: 'Split Sheets', path: '/splits' },
  ] },
  { label: 'Operations', icon: Building2, children: [
    { label: 'Advances', path: '/advances' },
    { label: 'Connectors', path: '/ai-providers' },
    { label: 'Compliance', path: '/compliance' },
  ] },
  { label: 'Help & Support', icon: Headphones, children: [
    { label: 'Academy & Guides', path: '/academy' },
  ] },
  { label: 'Account Settings', icon: Settings, path: '/settings' },
];

const influencerTree: TreeSection[] = [
  { label: 'Overview', icon: LayoutDashboard, defaultOpen: true, children: [{ label: 'Home', path: '/dashboard' }] },
  { label: 'Work', icon: Target, defaultOpen: true, children: [
    { label: 'Browse Missions', path: '/influencer/missions' },
    { label: 'My Campaigns', path: '/campaigns' },
  ] },
  { label: 'Content', icon: Camera, children: [
    { label: 'Creator Assets', path: '/assets' },
    { label: 'AI Studio', path: '/studio' },
  ] },
  { label: 'Playlists', icon: Music, defaultOpen: true, children: [
    { label: 'My Playlists', path: '/playlists' },
  ] },
  { label: 'Channels', icon: Share2, children: [
    { label: 'Connected Accounts', path: '/influencer/socials' },
  ] },
  { label: 'Earnings', icon: Wallet, children: [
    { label: 'Payouts', path: '/influencer/earnings' },
  ] },
  { label: 'Inbox', icon: Mail, children: [{ label: 'Messages', path: '/messages' }] },
  { label: 'Help & Support', icon: Headphones, children: [
    { label: 'Academy & Guides', path: '/academy' },
  ] },
  { label: 'Account Settings', icon: Settings, path: '/settings' },
];

const djTree: TreeSection[] = [
  { label: 'Overview', icon: LayoutDashboard, defaultOpen: true, children: [{ label: 'Home', path: '/dashboard' }] },
  { label: 'Packs', icon: Radio, defaultOpen: true, children: [
    { label: 'Promo Packs', path: '/dj/packs' },
  ] },
  { label: 'Content Studio', icon: Sparkles, children: [
    { label: 'AI Studio', path: '/studio' },
    { label: 'Creator Assets', path: '/assets' },
    { label: 'Playlists', path: '/playlists' },
  ] },
  { label: 'Feedback', icon: MessageSquare, children: [
    { label: 'Submit Feedback', path: '/dj/feedback' },
  ] },
  { label: 'Charts', icon: TrendingUp, children: [
    { label: 'Trends', path: '/trending' },
  ] },
  { label: 'Inbox', icon: Mail, children: [{ label: 'Messages', path: '/messages' }] },
  { label: 'Help & Support', icon: Headphones, children: [
    { label: 'Academy & Guides', path: '/academy' },
  ] },
  { label: 'Account Settings', icon: Settings, path: '/settings' },
];

/** Pick the dedicated nav tree for the current portal. */
function treeForRole(role: string): TreeSection[] {
  if (role === 'LABEL') return labelTree;
  if (role === 'INFLUENCER') return influencerTree;
  if (role === 'DJ') return djTree;
  return treeSections;
}

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
    treeForRole(role).forEach((s) => {
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

  // Every portal renders its own dedicated tree in the same accordion style.
  const baseTree = treeForRole(role);
  void artistNavGroups; void influencerNav; void djNav; // legacy, retained for presets

  // --- Workspace preset filtering ---------------------------------------
  // The Min/Creator/Full switcher toggles `enabled` modules; here we actually
  // reflect that in the nav. A nav link maps to a module by its path; if that
  // module is turned off (and not required), the link is hidden. Links with no
  // matching module (portal-specific pages, external links) always show.
  const moduleForPath = (path?: string): ModuleId | undefined => {
    if (!path || path.startsWith('http') || path === '#') return undefined;
    const clean = path.split('?')[0];
    if (clean === '/studio' || clean === '/studios') return 'studios';
    const exact = MODULES.find((m) => m.path === clean);
    if (exact) return exact.id;
    const pref = MODULES.find((m) => m.path !== '/' && clean.startsWith(m.path + '/'));
    return pref?.id;
  };
  const pathVisible = (path?: string): boolean => {
    const mid = moduleForPath(path);
    if (!mid) return true; // portal-specific / external → always show
    const def = MODULES.find((m) => m.id === mid);
    if (def?.required) return true;
    return isEnabled(mid);
  };
  // Filtering only applies where the preset switcher is shown (artist/label);
  // influencer/DJ portals are already lean + purpose-built.
  const applyPreset = role === 'ARTIST' || role === 'LABEL';
  const activeTree: TreeSection[] = !applyPreset
    ? baseTree
    : baseTree
        .map((section) => {
          if (!section.children) return section;
          return { ...section, children: section.children.filter((c) => pathVisible(c.path)) };
        })
        .filter((section) => {
          // Direct-link section (no children) — keep if its own path is visible.
          if (section.path && (!section.children || section.children.length === 0)) {
            return pathVisible(section.path);
          }
          // Accordion section — keep only if it still has visible children.
          return !!section.children && section.children.length > 0;
        });

  const resetPortal = () => {
    localStorage.removeItem('dropkast_welcome_seen');
    window.location.reload();
  };

  // --- Resizable + collapsible sidebar (desktop) ---
  const MIN_W = 208;
  const MAX_W = 420;
  const DEFAULT_W = 268;
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('dropkast_sidebar_collapsed') === '1'; } catch { return false; }
  });
  const [width, setWidth] = useState(() => {
    try {
      const v = Number(localStorage.getItem('dropkast_sidebar_width'));
      return v >= MIN_W && v <= MAX_W ? v : DEFAULT_W;
    } catch { return DEFAULT_W; }
  });
  const draggingRef = useRef(false);

  useEffect(() => { try { localStorage.setItem('dropkast_sidebar_width', String(width)); } catch { /* ignore */ } }, [width]);
  useEffect(() => { try { localStorage.setItem('dropkast_sidebar_collapsed', collapsed ? '1' : '0'); } catch { /* ignore */ } }, [collapsed]);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMove = (ev: MouseEvent) => {
      if (!draggingRef.current) return;
      setWidth(Math.min(MAX_W, Math.max(MIN_W, ev.clientX)));
    };
    const onUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  return (
    <>
    {/* Floating re-open button when collapsed (desktop only) */}
    {collapsed && (
      <button
        onClick={() => setCollapsed(false)}
        className="hidden md:flex fixed top-4 left-3 z-50 w-9 h-9 items-center justify-center bg-[var(--card-bg)] border border-[var(--border-main)] text-white/60 hover:text-primary hover:border-primary transition-all"
        aria-label="Open sidebar"
        title="Open sidebar"
      >
        <PanelLeft className="w-4 h-4" />
      </button>
    )}
    <aside
      style={{ ['--sbw' as any]: width + 'px' }}
      className={cn(
        'h-screen bg-[var(--bg-main)] border-r border-[var(--border-main)] flex flex-col z-40 backdrop-blur-md transition-transform duration-300 ease-out relative',
        // Mobile: fixed off-canvas drawer at a comfortable fixed width
        'w-[min(86vw,20rem)] fixed top-0 left-0 md:relative md:translate-x-0',
        // Desktop: user-resizable width, or fully collapsed
        collapsed ? 'md:w-0 md:min-w-0 md:overflow-hidden md:border-0' : 'md:w-[var(--sbw)]',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}
    >
      {/* Drag-to-resize handle (desktop only) */}
      {!collapsed && (
        <div
          onMouseDown={startResize}
          className="hidden md:block absolute top-0 right-0 h-full w-1.5 cursor-col-resize z-50 hover:bg-primary/40 active:bg-primary/60 transition-colors"
          title="Drag to resize"
        />
      )}

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
        <div className="flex items-center gap-1 shrink-0">
          {/* Collapse (desktop only) */}
          <button
            onClick={() => setCollapsed(true)}
            className="hidden md:flex w-8 h-8 items-center justify-center text-white/30 hover:text-primary transition-colors"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
          {/* Close (mobile drawer) */}
          <button
            onClick={onClose}
            className="md:hidden p-4 -mr-4 text-white/40 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pinned New Release CTA — only for artists */}
      {role === 'ARTIST' && (
        <div className="px-3 pt-3 pb-2 shrink-0">
          <Link
            to="/releases/new"
            data-tour="new-release"
            className="beam flex items-center justify-between w-full bg-white text-black font-mono font-black uppercase text-[10px] tracking-widest px-4 py-2.5 transition-all active:scale-95"
          >
            <span>New Release</span>
            <PlusCircle className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Scrollable nav — dedicated tree per portal, same accordion style */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar min-h-0 py-2 overscroll-contain">
        {(
          <div className="space-y-0.5">
            {activeTree.map((section) => {
              const kids = section.children ?? [];
              // Direct-link section (no dropdown) — e.g. Account Settings → Settings.
              if (section.path && kids.length === 0) {
                const active = location.pathname === section.path.split('?')[0];
                return (
                  <Link
                    key={section.label}
                    to={section.path}
                    className={cn(
                      'w-full flex items-center gap-3 px-5 py-2.5 transition-all group text-left',
                      active ? 'text-primary bg-primary/5' : 'text-white/40',
                    )}
                  >
                    <section.icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-[10px] font-bold uppercase tracking-widest font-mono leading-none">
                      {section.label}
                    </span>
                  </Link>
                );
              }
              const isOpen = openSections[section.label] ?? false;
              const hasActiveChild = isChildActive(kids);
              const isActive = kids.some((c) => location.pathname === c.path) || hasActiveChild;

              return (
                <div key={section.label}>
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.label)}
                    className={cn(
                      'w-full flex items-center gap-3 px-5 py-2.5 transition-all group text-left',
                      isActive
                        ? 'text-primary bg-primary/5'
                        : 'text-white/40',
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
                      {kids.map((child) => {
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
                                : 'text-white/30',
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
    </>
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
          : 'text-[var(--text-main)]/40',
      )}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
      <item.icon
        className={cn(
          'w-4 h-4 transition-transform shrink-0',
          active ? 'text-primary scale-110' : 'text-white/30',
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
          hasActive ? 'text-primary' : 'text-white/30',
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
          {items.map((child) => {
            const external = /^https?:\/\//.test(child.path);
            const cls = cn(
              'block px-4 py-1.5 text-[8px] font-bold uppercase tracking-widest font-mono transition-all',
              location.pathname === child.path ? 'text-primary' : 'text-white/20',
            );
            return external ? (
              <a key={child.path} href={child.path} target="_blank" rel="noopener noreferrer" className={cls}>
                {child.label} ↗
              </a>
            ) : (
              <Link key={child.path} to={child.path} className={cls}>
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
