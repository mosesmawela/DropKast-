import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Plug,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  TestTube,
  Trash2,
  Cpu,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ALL_PROVIDERS, type ProviderModel } from '../lib/ai-providers';
import { toast } from 'sonner';

const STORAGE_KEY = 'dropkast_byok_keys';

function loadKeys(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveKeys(keys: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

type ConnectorStatus = 'unknown' | 'testing' | 'connected' | 'failed';

interface ConnectorState {
  key: string;
  visible: boolean;
  status: ConnectorStatus;
  error?: string;
}

export default function AIProviders() {
  const [connectors, setConnectors] = useState<Record<string, ConnectorState>>(() => {
    const saved = loadKeys();
    const result: Record<string, ConnectorState> = {};
    for (const p of ALL_PROVIDERS) {
      const envVar = p.envVar;
      if (!result[envVar]) {
        result[envVar] = {
          key: saved[envVar] || '',
          visible: false,
          status: saved[envVar] ? 'unknown' : 'unknown',
        };
      }
    }
    return result;
  });

  const [envProviders, setEnvProviders] = useState<{ envVar: string; configured: boolean }[]>([]);

  useEffect(() => {
    fetch('/api/ai/providers')
      .then(r => r.json())
      .then(d => {
        const list = (d.providers || []) as any[];
        setEnvProviders(list.map((p: any) => ({
          envVar: CONFIG_MAP[p.id] || `${p.id.toUpperCase()}_API_KEY`,
          configured: p.configured,
        })));
      })
      .catch(() => {});
  }, []);

  const getKeyValue = useCallback((envVar: string) => {
    return connectors[envVar]?.key || '';
  }, [connectors]);

  const setKeyValue = useCallback((envVar: string, value: string) => {
    setConnectors(prev => ({
      ...prev,
      [envVar]: { ...prev[envVar], key: value, status: 'unknown', error: undefined },
    }));
  }, []);

  const toggleVisible = useCallback((envVar: string) => {
    setConnectors(prev => ({
      ...prev,
      [envVar]: { ...prev[envVar], visible: !prev[envVar].visible },
    }));
  }, []);

  const saveAllKeys = useCallback(() => {
    const toSave: Record<string, string> = {};
    for (const [envVar, state] of Object.entries(connectors)) {
      if (state.key) toSave[envVar] = state.key;
    }
    saveKeys(toSave);
    toast.success('API keys saved locally');
  }, [connectors]);

  const testKey = useCallback(async (envVar: string) => {
    const key = connectors[envVar]?.key;
    if (!key) {
      toast.error('Enter an API key first');
      return;
    }
    setConnectors(prev => ({
      ...prev,
      [envVar]: { ...prev[envVar], status: 'testing', error: undefined },
    }));

    const providerId = PROVIDER_ID_MAP[envVar];
    if (!providerId) {
      setConnectors(prev => ({
        ...prev,
        [envVar]: { ...prev[envVar], status: 'failed', error: 'Unknown provider' },
      }));
      return;
    }

    try {
      const res = await fetch('/api/ai/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId, apiKey: key }),
      });
      const data = await res.json();
      if (data.ok) {
        setConnectors(prev => ({
          ...prev,
          [envVar]: { ...prev[envVar], status: 'connected', error: undefined },
        }));
        toast.success(`${providerId} key is valid`);
      } else {
        setConnectors(prev => ({
          ...prev,
          [envVar]: { ...prev[envVar], status: 'failed', error: data.error || 'Invalid key' },
        }));
        toast.error(`${providerId}: ${data.error || 'Invalid key'}`);
      }
    } catch (err: any) {
      setConnectors(prev => ({
        ...prev,
        [envVar]: { ...prev[envVar], status: 'failed', error: err.message },
      }));
    }
  }, [connectors]);

  const clearKey = useCallback((envVar: string) => {
    setConnectors(prev => ({
      ...prev,
      [envVar]: { ...prev[envVar], key: '', status: 'unknown', error: undefined },
    }));
  }, []);

  const hasLocalKeys = Object.values(connectors).some(c => c.key.length > 0);
  const configuredCount = Object.values(connectors).filter(c => c.key.length > 0).length;

  // Group providers by envVar for display
  const groups: { envVar: string; providers: ProviderModel[] }[] = [];
  const seen = new Set<string>();
  for (const p of ALL_PROVIDERS) {
    if (!seen.has(p.envVar)) {
      seen.add(p.envVar);
      groups.push({ envVar: p.envVar, providers: ALL_PROVIDERS.filter(x => x.envVar === p.envVar) });
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <header className="border-b border-[var(--border-main)] pb-5">
        <div className="flex items-center gap-3 mb-2">
          <Plug className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-primary italic">
            Connectors
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-mono font-black tracking-tighter text-[var(--text-main)] italic uppercase">
          Bring Your Own Key
        </h1>
        <p className="text-[var(--text-main)]/40 mt-1 text-xs max-w-2xl">
          Connect your own API keys to power AI features in your workspace. Keys are stored locally in your browser and sent per-request — they never touch our database.
        </p>
      </header>

      {/* Status summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="manifest-card border border-green-500/20 bg-green-500/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-green-500 italic">
              Connected
            </span>
          </div>
          <p className="text-2xl font-mono font-black text-green-500">{configuredCount}</p>
          <p className="text-[10px] text-[var(--text-main)]/50 mt-1">providers with keys saved</p>
        </div>
        <div className="manifest-card border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-primary italic">
              AI Features
            </span>
          </div>
          <p className="text-xs text-[var(--text-main)]/70 leading-relaxed">
            Any connected provider automatically powers the chat assistant, A&R critique, campaign strategy, and more.
          </p>
        </div>
        <div className="manifest-card border border-[var(--border-main)] bg-[var(--card-bg)] p-4">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="w-3.5 h-3.5 text-[var(--text-main)]/50" />
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-[var(--text-main)]/50 italic">
              Privacy
            </span>
          </div>
          <p className="text-xs text-[var(--text-main)]/70 leading-relaxed">
            Keys never stored on our servers. Sent directly from your browser to the provider API. Encrypted in transit.
          </p>
        </div>
      </section>

      {/* Main connector list */}
      <div className="space-y-3">
        {groups.map((g) => {
          const envVar = g.envVar;
          const conn = connectors[envVar];
          const mainProvider = g.providers[0];
          const isConfigured = envProviders.find(e => e.envVar === envVar)?.configured ?? false;
          const hasKey = conn?.key.length > 0;

          return (
            <motion.div
              key={envVar}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="manifest-card border border-[var(--border-main)] bg-[var(--card-bg)] transition-colors"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'text-[8px] font-mono font-black uppercase tracking-widest italic px-1.5 py-0.5 border',
                        hasKey || isConfigured
                          ? 'text-green-500 border-green-500/30 bg-green-500/5'
                          : 'text-[var(--text-main)]/30 border-[var(--border-main)]',
                      )}>
                        {hasKey || isConfigured ? 'Connected' : 'Not Connected'}
                      </span>
                      <span className="text-[9px] font-mono font-black uppercase tracking-[0.3em] text-[var(--text-main)]/40 italic truncate">
                        {mainProvider.vendor}
                      </span>
                    </div>
                    <h3 className="text-sm font-mono font-black italic text-[var(--text-main)] truncate">
                      {mainProvider.name}
                    </h3>
                    <p className="text-[10px] text-[var(--text-main)]/60 mt-1 leading-relaxed">
                      {mainProvider.blurb}
                    </p>
                    {g.providers.length > 1 && (
                      <p className="text-[9px] text-[var(--text-main)]/40 mt-1 italic">
                        Also supports: {g.providers.slice(1).map(p => p.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {conn?.status === 'testing' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                    {conn?.status === 'connected' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {conn?.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    {conn?.status === 'unknown' && hasKey && <KeyRound className="w-5 h-5 text-[var(--text-main)]/30" />}
                  </div>
                </div>

                {/* Key input */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[180px]">
                    <input
                      type={conn?.visible ? 'text' : 'password'}
                      value={conn?.key || ''}
                      onChange={(e) => setKeyValue(envVar, e.target.value)}
                      placeholder={isConfigured ? `Already set via env var (${envVar})` : `Enter ${envVar}`}
                      className={cn(
                        'w-full bg-black border px-3 py-2 text-xs font-mono outline-none transition-all pr-20',
                        conn?.status === 'connected'
                          ? 'border-green-500/50 text-green-500'
                          : conn?.status === 'failed'
                          ? 'border-red-500/50 text-red-500'
                          : 'border-[var(--border-main)] text-[var(--text-main)] focus:border-primary',
                      )}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        onClick={() => toggleVisible(envVar)}
                        className="p-1 text-[var(--text-main)]/30 transition-colors"
                        title={conn?.visible ? 'Hide key' : 'Show key'}
                      >
                        {conn?.visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => testKey(envVar)}
                    disabled={!hasKey || conn?.status === 'testing'}
                    className="h-10 px-3 border border-[var(--border-main)] text-[var(--text-main)]/60 text-[10px] font-mono font-black uppercase italic tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                    title="Test this key"
                  >
                    <TestTube className="w-3 h-3" />
                    Test
                  </button>

                  <a
                    href={mainProvider.signupUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 px-3 border border-[var(--border-main)] text-[var(--text-main)]/60 text-[10px] font-mono font-black uppercase italic tracking-widest transition-all flex items-center gap-1.5"
                    title="Get API key"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Get Key
                  </a>

                  {hasKey && (
                    <button
                      onClick={() => clearKey(envVar)}
                      className="h-10 px-3 border border-red-500/30 text-red-500/60 text-[10px] font-mono font-black uppercase italic tracking-widest transition-all flex items-center gap-1.5"
                      title="Remove key"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {conn?.error && (
                  <p className="text-[10px] text-red-500/80 mt-2 font-mono">{conn.error}</p>
                )}

                {isConfigured && (
                  <p className="text-[9px] text-green-500/60 mt-2 italic">
                    This provider is pre-configured via server environment variable.
                  </p>
                )}

                <div className="flex items-center gap-4 mt-3">
                  <code className="text-[8px] font-mono text-[var(--text-main)]/30">{envVar}</code>
                  {mainProvider.freeTier && (
                    <span className="text-[8px] text-green-500/60 italic">{mainProvider.freeTier}</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Save all */}
      {hasLocalKeys && (
        <div className="flex items-center justify-between gap-4 manifest-card border border-primary/30 bg-primary/5 p-4">
          <div className="min-w-0">
            <p className="text-xs font-mono font-black italic text-primary uppercase tracking-widest">
              {configuredCount} key{configuredCount !== 1 ? 's' : ''} saved locally
            </p>
            <p className="text-[10px] text-[var(--text-main)]/50 mt-1">
              Keys persist in your browser. Clear them anytime by removing each key above.
            </p>
          </div>
          <button
            onClick={saveAllKeys}
            className="h-10 px-5 shrink-0 bg-primary text-white text-[10px] font-mono font-black uppercase italic tracking-widest active:scale-95 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Save All
          </button>
        </div>
      )}

      {/* How it works */}
      <section className="manifest-card border border-[var(--border-main)] bg-[var(--card-bg)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-primary italic">
            How It Works
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[var(--text-main)]/70 leading-relaxed">
          <div>
            <span className="text-primary font-black italic">01.</span> Enter your API key from any supported provider. Keys are stored in your browser's localStorage.
          </div>
          <div>
            <span className="text-primary font-black italic">02.</span> When you use AI features, your key is sent directly from your browser to the provider API — never stored on DropKast servers.
          </div>
          <div>
            <span className="text-primary font-black italic">03.</span> Test your key with the "Test" button. A successful test means that provider is ready to power your AI assistant, A&R critique, and more.
          </div>
        </div>
      </section>

      {/* Free tier notice */}
      <section className="manifest-card border border-green-500/20 bg-green-500/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-green-500 italic">
            No Key? No Problem
          </span>
        </div>
        <p className="text-xs text-[var(--text-main)]/70 leading-relaxed">
          If the workspace has pre-configured keys (NVIDIA, Groq, Cerebras, OpenRouter free tiers), they're available
          immediately without adding anything. Adding your own key is for upgrading to premium models or using your own accounts.
        </p>
      </section>
    </div>
  );
}

const CONFIG_MAP: Record<string, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  nvidia: 'NVIDIA_API_KEY',
  groq: 'GROQ_API_KEY',
  cerebras: 'CEREBRAS_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  moonshot: 'MOONSHOT_API_KEY',
  openai: 'OPENAI_API_KEY',
  google: 'GOOGLE_API_KEY',
};

const PROVIDER_ID_MAP: Record<string, string> = {
  ANTHROPIC_API_KEY: 'anthropic',
  NVIDIA_API_KEY: 'nvidia',
  GROQ_API_KEY: 'groq',
  CEREBRAS_API_KEY: 'cerebras',
  OPENROUTER_API_KEY: 'openrouter',
  MOONSHOT_API_KEY: 'moonshot',
  OPENAI_API_KEY: 'openai',
  GOOGLE_API_KEY: 'google',
  FAL_API_KEY: 'fal',
  KLING_API_KEY: 'kling',
  RUNWAY_API_KEY: 'runway',
  LUMA_API_KEY: 'luma',
  PIKA_API_KEY: 'pika',
  HAILUO_API_KEY: 'hailuo',
  IDEOGRAM_API_KEY: 'ideogram',
};
