import { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Database,
  LogOut,
  Smartphone,
  Palette,
  Zap,
  Cpu,
  Box,
  Minus,
  GlassWater,
  Camera,
  Radio,
  Sparkles,
  Music,
  Disc,
  Plus,
  Check,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTheme, VisualStyle } from '../context/ThemeContext';
import { useAI } from '../context/AIContext';
import { useTutorial } from '../context/TutorialContext';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  MODULES,
  PRESETS,
  CATEGORY_LABEL as MODULE_CAT_LABEL,
  CATEGORY_DESCRIPTION as MODULE_CAT_DESC,
  type ModuleCategory,
  type WorkspacePreset,
} from '../lib/workspace';
import Switch from '../components/ui/Switch';

const styles: { id: VisualStyle; label: string; icon: any; desc: string }[] = [
  { id: 'default', label: 'Technical', icon: Cpu, desc: 'Industrial terminal aesthetic' },
  { id: 'neumorphism', label: 'Neumorphism', icon: Smartphone, desc: 'Soft shadows, plastic surfaces' },
  { id: 'material', label: 'Material', icon: Box, desc: 'Clean shadows and flat cards' },
  { id: 'brutalism', label: 'Neo-Brutalism', icon: Zap, desc: 'High contrast, thick borders' },
  { id: 'skeuomorphism', label: 'Skeuomorphic', icon: Palette, desc: 'Real-world textures and depth' },
  { id: 'minimalist', label: 'Minimal', icon: Minus, desc: 'Zero distraction, absolute focus' },
  { id: 'glassmorphism', label: 'Glass', icon: GlassWater, desc: 'Frosted surfaces, fluid motion' },
];

const PRESET_VIBES = [
  { id: 'TECHNICAL_ORANGE', name: 'Tech Orange', color: '#FF4D00' },
  { id: 'LVRN_GREEN', name: 'LVRN Green', color: '#acec00' },
  { id: 'NEON_PINK', name: 'Neon Pink', color: '#ff00ff' },
  { id: 'CYBER_BLUE', name: 'Cyber Blue', color: '#00f2ff' },
  { id: 'MONO_WHITE', name: 'Mono White', color: '#ffffff' },
  { id: 'SUNSET_GOLD' as any, name: 'Sunset Gold', color: '#FFB627' },
  { id: 'DEEP_VIOLET' as any, name: 'Deep Violet', color: '#8B5CF6' },
  { id: 'ACID_LIME' as any, name: 'Acid Lime', color: '#84CC16' },
  { id: 'CORAL_HEAT' as any, name: 'Coral Heat', color: '#FF5C7C' },
  { id: 'ARCTIC_TEAL' as any, name: 'Arctic Teal', color: '#06B6D4' },
];

const TABS = [
  { id: 'IDENTITY', label: 'Identity', icon: User },
  { id: 'WORKSPACE', label: 'Workspace', icon: Box },
  { id: 'APPEARANCE', label: 'Appearance', icon: Palette },
  { id: 'AI', label: 'AI Engine', icon: Sparkles },
  { id: 'TUTORIAL', label: 'Tutorial', icon: Zap },
  { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
  { id: 'SECURITY', label: 'Security', icon: Shield },
  { id: 'BILLING', label: 'Billing', icon: CreditCard },
  { id: 'GATEWAYS', label: 'Gateways', icon: Globe },
  { id: 'DATA', label: 'Data', icon: Database },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Settings() {
  const navigate = useNavigate();
  const { theme, visualStyle, vibe, role, toggleTheme, setVisualStyle, setVibe, setRole } = useTheme();
  const { autoSendDJs, autoGenerateContent, autoOptimizeAds, toggleAutoSendDJs, toggleAutoGenerateContent, toggleAutoOptimizeAds } = useAI();
  const { enabled: tutorialEnabled, setEnabled: setTutorialEnabled, start: startTutorial } = useTutorial();
  const { logout } = useAuth();
  const { enabled: enabledModules, toggle: toggleModule, setPreset: setWorkspacePreset } = useWorkspace();

  const [activeTab, setActiveTab] = useState<TabId>('IDENTITY');
  const [customColor, setCustomColor] = useState('#FF4D00');

  const applyCustomColor = () => {
    document.documentElement.style.setProperty('--color-primary', customColor);
    const rgb = hexToRgb(customColor);
    if (rgb) document.documentElement.style.setProperty('--primary-raw', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    localStorage.setItem('campaign-os-custom-color', customColor);
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="flex items-end justify-between border-b border-[var(--border-main)] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-mono font-black tracking-tighter text-[var(--text-main)] italic uppercase">
            Settings
          </h1>
          <p className="text-[var(--text-main)]/40 mt-1 text-xs">
            Manage your identity, appearance, AI engine, and account.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
        {/* Tab nav */}
        <aside className="space-y-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-mono font-black uppercase italic tracking-widest transition-all',
                  active
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-[var(--text-main)]/40 hover:text-[var(--text-main)] hover:bg-white/[0.02] border-l-2 border-transparent',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-mono font-black uppercase italic tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all border-l-2 border-transparent mt-4"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </aside>

        {/* Tab content */}
        <motion.main
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="space-y-5"
        >
          {activeTab === 'IDENTITY' && (
            <Card title="Identity Protocol" desc="Switch the active portal — your dashboard, sidebar, and tools update accordingly.">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'ARTIST', label: 'Artist Core', icon: Music, desc: 'Make the music' },
                  { id: 'INFLUENCER', label: 'Creator Relay', icon: Camera, desc: 'Make content' },
                  { id: 'DJ', label: 'Vibe Selecta', icon: Disc, desc: 'Move the floor' },
                ].map((r) => {
                  const Icon = r.icon;
                  const active = role === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id as any)}
                      className={cn(
                        'flex flex-col items-start gap-2 p-4 border transition-all text-left',
                        active
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-[var(--border-main)] hover:border-white/20',
                      )}
                    >
                      <Icon className={cn('w-4 h-4', active ? 'text-primary' : 'text-[var(--text-main)]/40')} />
                      <div className="text-xs font-mono font-black italic uppercase tracking-widest">{r.label}</div>
                      <div className="text-[9px] font-mono text-[var(--text-main)]/40 uppercase tracking-widest italic">
                        {r.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {activeTab === 'WORKSPACE' && (
            <>
              <Card
                title="Build your studio"
                desc="Turn modules on or off. Hide what you don't use — your sidebar stays clean. Your choice is saved instantly."
              >
                <div className="space-y-3 mb-6">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Quick presets</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(Object.keys(PRESETS) as WorkspacePreset[]).map((p) => {
                      const preset = PRESETS[p];
                      return (
                        <button
                          key={p}
                          onClick={() => setWorkspacePreset(p)}
                          className="manifest-card p-5 bg-dark border border-white/10 hover:border-primary text-left transition-all group"
                        >
                          <div className="text-base font-black italic text-white mb-2 group-hover:text-primary transition-colors">
                            {preset.label}
                          </div>
                          <div className="text-[11px] text-white/40 leading-relaxed italic mb-3">
                            {preset.description}
                          </div>
                          <div className="text-[9px] font-black text-primary uppercase tracking-widest italic">
                            {preset.modules.length} modules
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6 space-y-8">
                  {(['core', 'ai-tools', 'creators', 'business'] as ModuleCategory[]).map((cat) => {
                    const inCat = MODULES.filter((m) => m.category === cat);
                    if (!inCat.length) return null;
                    return (
                      <div key={cat} className="space-y-3">
                        <div>
                          <h4 className="text-sm font-black italic text-white tracking-tight">
                            {MODULE_CAT_LABEL[cat]}
                          </h4>
                          <p className="text-[11px] text-white/40 italic mt-1">{MODULE_CAT_DESC[cat]}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {inCat.map((m) => {
                            const isOn = enabledModules.has(m.id);
                            const isLocked = !!m.required;
                            return (
                              <button
                                key={m.id}
                                onClick={() => !isLocked && toggleModule(m.id)}
                                disabled={isLocked}
                                className={cn(
                                  'flex items-start gap-3 p-3 border transition-all text-left',
                                  isOn
                                    ? 'border-primary bg-primary/5'
                                    : 'border-white/5 hover:border-white/20',
                                  isLocked && 'opacity-60 cursor-not-allowed',
                                )}
                              >
                                <div
                                  className={cn(
                                    'w-5 h-5 border-2 flex items-center justify-center shrink-0 mt-0.5',
                                    isOn ? 'border-primary bg-primary' : 'border-white/20',
                                  )}
                                >
                                  {isOn && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-black text-white italic flex items-center gap-2">
                                    {m.label}
                                    {isLocked && (
                                      <span className="text-[8px] font-black text-white/30 uppercase tracking-widest italic">Required</span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-white/40 italic mt-1 leading-relaxed">
                                    {m.description}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          )}

          {activeTab === 'APPEARANCE' && (
            <>
              <Card title="Theme" desc="Light or dark mode. Affects the whole app.">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono font-black italic uppercase tracking-widest text-[var(--text-main)]">
                      Dark Mode
                    </p>
                    <p className="text-[10px] text-[var(--text-main)]/40 mt-1">Optimized for studio sessions.</p>
                  </div>
                  <Switch checked={theme === 'dark'} onChange={toggleTheme} />
                </div>
              </Card>

              <Card title="Accent Color — Presets" desc="The primary color used across buttons, charts, and highlights.">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PRESET_VIBES.map((v) => {
                    const active = vibe === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setVibe(v.id as any)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-3 border transition-all',
                          active
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-[var(--border-main)] hover:border-white/20',
                        )}
                      >
                        <div
                          className="w-8 h-8 rounded-sm relative overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${v.color}, ${v.color}99)` }}
                        >
                          {active && (
                            <Check className="absolute inset-0 m-auto w-4 h-4 text-black mix-blend-difference" />
                          )}
                        </div>
                        <span className={cn('text-[9px] font-mono font-black uppercase tracking-widest italic', active ? 'text-primary' : 'text-[var(--text-main)]/50')}>
                          {v.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card title="Accent Color — Custom Hex" desc="Pick any color. Applies immediately and persists across sessions.">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-12 h-12 rounded-sm cursor-pointer border border-[var(--border-main)] bg-transparent"
                    />
                    <div>
                      <div className="text-[9px] font-mono font-black uppercase tracking-widest italic text-[var(--text-main)]/40 mb-1">
                        Custom Color
                      </div>
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => /^#[0-9a-fA-F]*$/.test(e.target.value) && setCustomColor(e.target.value)}
                        className="bg-transparent border border-[var(--border-main)] focus:border-primary outline-none px-2 py-1 text-xs font-mono uppercase tracking-widest w-32"
                      />
                    </div>
                  </label>
                  <button
                    onClick={applyCustomColor}
                    className="h-10 px-4 bg-primary text-white text-[10px] font-mono font-black uppercase italic tracking-widest hover:scale-[1.03] active:scale-95 transition-all"
                  >
                    Apply Custom
                  </button>
                </div>
              </Card>

              <Card title="Visual Style" desc="The structural language of the UI. Each style re-skins cards, buttons, and surfaces.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {styles.map((s) => {
                    const Icon = s.icon;
                    const active = visualStyle === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setVisualStyle(s.id)}
                        className={cn(
                          'p-3 border text-left transition-all',
                          active
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-[var(--border-main)] hover:border-white/20',
                        )}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Icon className={cn('w-4 h-4', active ? 'text-primary' : 'text-[var(--text-main)]/40')} />
                          {active && <Check className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <div className="text-[11px] font-mono font-black italic uppercase tracking-widest text-[var(--text-main)]">
                          {s.label}
                        </div>
                        <div className="text-[9px] font-mono text-[var(--text-main)]/40 uppercase tracking-widest italic mt-0.5">
                          {s.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </>
          )}

          {activeTab === 'AI' && (
            <Card title="AI Automation" desc="Permissions for the on-board AI assistant.">
              <ToggleRow label="Auto-send to DJs" desc="Automated distribution to verified DJ clusters" checked={autoSendDJs} onChange={toggleAutoSendDJs} />
              <ToggleRow label="Auto content generation" desc="Generate covers, viral ideas, captions on each new release" checked={autoGenerateContent} onChange={toggleAutoGenerateContent} />
              <ToggleRow label="Auto ad optimization" desc="Algorithmic budget management across paid platforms" checked={autoOptimizeAds} onChange={toggleAutoOptimizeAds} />
            </Card>
          )}

          {activeTab === 'TUTORIAL' && (
            <Card title="Tutorial Tour" desc="Spotlight walkthrough of the main features.">
              <ToggleRow
                label="Tutorial enabled"
                desc="Show the onboarding tour on first dashboard load. Disable to never see it again."
                checked={tutorialEnabled}
                onChange={() => setTutorialEnabled(!tutorialEnabled)}
              />
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-main)]">
                <div>
                  <p className="text-xs font-mono font-black italic uppercase tracking-widest text-[var(--text-main)]">
                    Replay tour
                  </p>
                  <p className="text-[10px] text-[var(--text-main)]/40 mt-1">Step through the tutorial again right now.</p>
                </div>
                <button
                  onClick={() => {
                    setTutorialEnabled(true);
                    localStorage.removeItem('dropkast_tutorial_seen');
                    startTutorial();
                  }}
                  className="h-9 px-4 bg-primary text-white text-[10px] font-mono font-black uppercase italic tracking-widest hover:scale-[1.03] active:scale-95 transition-all"
                >
                  Start tour
                </button>
              </div>
            </Card>
          )}

          {activeTab === 'NOTIFICATIONS' && (
            <Card title="Notification Preferences" desc="Control what shows in the bell inbox and as toasts.">
              <p className="text-xs text-[var(--text-main)]/40 italic">
                Notifications are persistent (kept in your inbox until cleared) and ephemeral (toasts that auto-dismiss after 5s). Granular per-event settings ship in the next update.
              </p>
            </Card>
          )}

          {activeTab === 'SECURITY' && (
            <Card title="Security" desc="Account-level security. More options arrive when Supabase Auth is fully configured.">
              <p className="text-xs text-[var(--text-main)]/40 italic">
                Currently using {import.meta.env.VITE_SUPABASE_URL ? 'Supabase Auth' : 'mock localStorage auth (demo mode)'}.
              </p>
            </Card>
          )}

          {activeTab === 'BILLING' && (
            <Card title="Billing" desc="Subscriptions, invoices, and AI usage budget.">
              <p className="text-xs text-[var(--text-main)]/40 italic">
                Stripe integration ships in Phase 3. AI usage budget defaults to $1/day per user — override via the
                <code className="font-mono mx-1 text-primary">AI_DAILY_BUDGET_CENTS</code> env var.
              </p>
            </Card>
          )}

          {activeTab === 'GATEWAYS' && (
            <Card title="Distribution Gateways" desc="Which DSPs you publish to.">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Spotify', 'Apple Music', 'YouTube Music', 'Tidal', 'SoundCloud', 'Amazon Music'].map((p) => (
                  <div key={p} className="flex items-center gap-2 p-3 border border-[var(--border-main)] bg-[var(--card-bg)]">
                    <Check className="w-3 h-3 text-green-500" />
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest italic text-[var(--text-main)]/80">
                      {p}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'DATA' && (
            <>
              <Card title="Export Data" desc="Download a JSON archive of your releases, campaigns, and analytics.">
                <button className="h-10 px-4 border border-[var(--border-main)] hover:border-primary hover:text-primary text-[var(--text-main)]/60 text-[10px] font-mono font-black uppercase italic tracking-widest transition-all">
                  Request Export
                </button>
              </Card>
              <Card title="Danger Zone" desc="Permanent and irreversible." danger>
                <button className="h-10 px-4 border border-red-500/50 text-red-500 text-[10px] font-mono font-black uppercase italic tracking-widest hover:bg-red-500 hover:text-white transition-all">
                  Delete Account
                </button>
              </Card>
            </>
          )}
        </motion.main>
      </div>
    </div>
  );
}

function Card({ title, desc, children, danger }: { title: string; desc?: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <section
      className={cn(
        'manifest-card border p-5 bg-[var(--card-bg)]',
        danger ? 'border-red-500/20' : 'border-[var(--border-main)]',
      )}
    >
      <div className="mb-4">
        <h2 className={cn('text-xs font-mono font-black uppercase tracking-[0.3em] italic', danger ? 'text-red-500' : 'text-primary')}>
          {title}
        </h2>
        {desc && <p className="text-[10px] text-[var(--text-main)]/40 mt-1 italic">{desc}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-mono font-black italic uppercase tracking-widest text-[var(--text-main)]">{label}</p>
        <p className="text-[10px] text-[var(--text-main)]/40 mt-0.5">{desc}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}
