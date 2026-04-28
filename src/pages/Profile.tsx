import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useReleases } from '../context/ReleaseContext';
import { useNotify } from '../context/NotificationContext';
import { Camera, Save, Mail, User as UserIcon, Cpu, Radio, Music, ExternalLink, Wallet, BarChart, Disc } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const ROLE_META = {
  ARTIST: { label: 'Artist Core', icon: Music, color: '#FF4D00' },
  INFLUENCER: { label: 'Creator Relay', icon: Camera, color: '#00f2ff' },
  DJ: { label: 'Vibe Selecta', icon: Disc, color: '#acec00' },
} as const;

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { role } = useTheme();
  const { releases } = useReleases();
  const { notify } = useNotify();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    artistName: user?.artistName || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    bio: (user as any)?.bio || '',
  });

  const handleSave = () => {
    updateUser({
      artistName: draft.artistName,
      avatar: draft.avatar,
      ...(draft.bio ? { bio: draft.bio } as any : {}),
    });
    setEditing(false);
    notify('success', 'PROFILE_SAVED', 'Your profile has been updated.');
  };

  const meta = ROLE_META[role];
  const RoleIcon = meta.icon;
  const liveCount = releases?.length ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row gap-6 items-start sm:items-end justify-between border-b border-[var(--border-main)] pb-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 manifest-card corner-marker p-1 border-white/20 overflow-hidden">
              <img
                src={draft.avatar || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.artistName || 'artist'}`}
                alt={user?.artistName || 'Avatar'}
                className="w-full h-full object-cover grayscale-[0.2] contrast-110"
              />
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-7 h-7 border-2 border-black flex items-center justify-center"
              style={{ backgroundColor: meta.color }}
            >
              <RoleIcon className="w-3.5 h-3.5 text-black" />
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono font-black uppercase tracking-[0.3em] italic mb-1" style={{ color: meta.color }}>
              {meta.label}
            </div>
            <h1 className="text-3xl sm:text-4xl font-mono font-black uppercase italic tracking-tighter text-[var(--text-main)]">
              {user?.artistName || 'Anonymous'}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--text-main)]/40 font-mono">
              <Mail className="w-3 h-3" />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="h-10 px-5 border border-[var(--border-main)] hover:border-primary hover:text-primary text-[var(--text-main)]/60 text-[10px] font-mono font-black uppercase italic tracking-[0.3em] transition-all"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setDraft({ artistName: user?.artistName || '', email: user?.email || '', avatar: user?.avatar || '', bio: (user as any)?.bio || '' });
                }}
                className="h-10 px-5 border border-[var(--border-main)] hover:border-white text-[var(--text-main)]/60 text-[10px] font-mono font-black uppercase italic tracking-[0.3em] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="h-10 px-5 bg-primary text-white text-[10px] font-mono font-black uppercase italic tracking-[0.3em] flex items-center gap-2 hover:scale-[1.03] active:scale-95 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                Save
              </button>
            </>
          )}
        </div>
      </header>

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Releases', value: liveCount, icon: Music },
          { label: 'Role', value: meta.label, icon: RoleIcon },
          { label: 'Identity', value: (user?.id ?? '').slice(0, 8) || '—', icon: UserIcon, mono: true },
          { label: 'Status', value: 'Verified', icon: Cpu },
        ].map((s) => (
          <div key={s.label} className="manifest-card border border-[var(--border-main)] p-4 bg-[var(--card-bg)]">
            <div className="flex items-center gap-2 text-[9px] font-mono font-black uppercase tracking-[0.3em] text-[var(--text-main)]/30 italic">
              <s.icon className="w-3 h-3" />
              {s.label}
            </div>
            <div className={cn(
              'text-base font-mono font-black uppercase tracking-tight italic mt-1.5 text-[var(--text-main)]',
              s.mono && 'tracking-widest text-sm',
            )}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Edit form / Bio */}
      <section className="manifest-card border border-[var(--border-main)] p-6 bg-[var(--card-bg)] space-y-5">
        <h2 className="text-sm font-mono font-black uppercase tracking-[0.3em] text-primary italic">
          Profile Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Display Name"
            value={editing ? draft.artistName : user?.artistName || ''}
            editing={editing}
            onChange={(v) => setDraft((d) => ({ ...d, artistName: v }))}
          />
          <Field
            label="Email"
            value={user?.email || ''}
            editing={false}
            onChange={() => {}}
            readonly
          />
          <Field
            label="Avatar URL"
            value={editing ? draft.avatar : user?.avatar || ''}
            editing={editing}
            onChange={(v) => setDraft((d) => ({ ...d, avatar: v }))}
            full
          />
          <Field
            label="Bio"
            value={editing ? draft.bio : (user as any)?.bio || ''}
            editing={editing}
            onChange={(v) => setDraft((d) => ({ ...d, bio: v }))}
            multiline
            full
          />
        </div>
      </section>

      {/* Quick links */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Treasury', icon: Wallet, href: '/earnings', color: 'text-primary' },
          { label: 'Analytics', icon: BarChart, href: '/analytics', color: 'text-blue-400' },
          { label: 'Settings', icon: Cpu, href: '/settings', color: 'text-white' },
        ].map((q) => (
          <Link
            key={q.label}
            to={q.href}
            className="group flex items-center justify-between manifest-card border border-[var(--border-main)] p-4 bg-[var(--card-bg)] hover:border-primary transition-all"
          >
            <div className="flex items-center gap-3">
              <q.icon className={cn('w-4 h-4', q.color)} />
              <span className="text-xs font-mono font-black uppercase tracking-widest italic text-[var(--text-main)]">
                {q.label}
              </span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--text-main)]/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </section>

      {/* Linked accounts */}
      <section className="manifest-card border border-[var(--border-main)] p-6 bg-[var(--card-bg)] space-y-4">
        <h2 className="text-sm font-mono font-black uppercase tracking-[0.3em] text-primary italic">
          Linked Portals
        </h2>
        <p className="text-xs text-[var(--text-main)]/50">
          Your active portal is{' '}
          <span className="font-bold text-[var(--text-main)]">{meta.label}</span>. Switch portals via "Portal Reboot"
          in the sidebar to access the others.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['ARTIST', 'INFLUENCER', 'DJ'] as const).map((r) => {
            const m = ROLE_META[r];
            const Icon = m.icon;
            const active = role === r;
            return (
              <motion.div
                key={r}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex items-center gap-3 p-3 border transition-all',
                  active ? 'border-primary bg-primary/5' : 'border-[var(--border-main)] opacity-60',
                )}
              >
                <Icon className="w-4 h-4" style={{ color: m.color }} />
                <div>
                  <div className="text-[10px] font-mono font-black uppercase tracking-widest italic text-[var(--text-main)]">
                    {m.label}
                  </div>
                  <div className="text-[9px] font-mono text-[var(--text-main)]/40 uppercase tracking-widest italic">
                    {active ? 'Active' : 'Available'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  editing,
  onChange,
  multiline,
  readonly,
  full,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  multiline?: boolean;
  readonly?: boolean;
  full?: boolean;
}) {
  return (
    <div className={cn(full ? 'md:col-span-2' : '')}>
      <label className="text-[9px] font-mono font-black uppercase tracking-[0.3em] text-[var(--text-main)]/40 italic block mb-1.5">
        {label}
      </label>
      {editing && !readonly ? (
        multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full bg-transparent border border-[var(--border-main)] focus:border-primary outline-none px-3 py-2 text-sm text-[var(--text-main)] font-medium resize-none transition-colors"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent border border-[var(--border-main)] focus:border-primary outline-none px-3 py-2 text-sm text-[var(--text-main)] font-medium transition-colors"
          />
        )
      ) : (
        <div className="text-sm text-[var(--text-main)]/80 font-medium min-h-[1.5rem]">
          {value || <span className="text-[var(--text-main)]/30 italic">— not set —</span>}
        </div>
      )}
    </div>
  );
}
