import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthState } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

const BYPASS_EMAIL = import.meta.env.VITE_BYPASS_EMAIL || 'admin@dropkast.dev';
const BYPASS_PASSWORD = import.meta.env.VITE_BYPASS_PASSWORD || 'dropkast123';
const BYPASS_USER_ID = import.meta.env.VITE_BYPASS_USER_ID || 'dev-user-001';
const BYPASS_NAME = import.meta.env.VITE_BYPASS_NAME || 'Dev Admin';
const AUTH_BYPASS_ENABLED = import.meta.env.VITE_AUTH_BYPASS === 'true';

const BYPASS_STORAGE_KEY = 'dropkast_bypass_session';

function getBypassStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(BYPASS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function setBypassStoredUser(user: User): void {
  try {
    localStorage.setItem(BYPASS_STORAGE_KEY, JSON.stringify(user));
  } catch {/* ignore */}
}

function clearBypassStoredUser(): void {
  try {
    localStorage.removeItem(BYPASS_STORAGE_KEY);
  } catch {/* ignore */}
}

function makeBypassUser(email?: string): User {
  const e = email || BYPASS_EMAIL;
  return {
    id: BYPASS_USER_ID,
    email: e,
    artistName: e.split('@')[0],
    role: 'admin',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.split('@')[0]}`,
  };
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, artistName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  isBypassMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const bypassMode = AUTH_BYPASS_ENABLED && !isSupabaseConfigured;

  // Bootstrap: check Supabase session or bypass localStorage
  useEffect(() => {
    if (bypassMode) {
      const stored = getBypassStoredUser();
      if (stored) {
        setState({ user: stored, isAuthenticated: true, isLoading: false });
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
      return;
    }

    const supabase = getSupabase();

    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        const session = data.session;
        if (session?.user) {
          setState({
            user: toAppUser(session.user),
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      });

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setState({ user: toAppUser(session.user), isAuthenticated: true, isLoading: false });
        } else {
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      });
      return () => sub.subscription.unsubscribe();
    }

    setState((s) => ({ ...s, isLoading: false }));
  }, [bypassMode]);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true }));

    // Bypass mode: accept hardcoded dev credentials
    if (bypassMode) {
      const validEmail = BYPASS_EMAIL;
      const validPassword = BYPASS_PASSWORD;

      if (email.toLowerCase() !== validEmail.toLowerCase() || password !== validPassword) {
        setState((s) => ({ ...s, isLoading: false }));
        throw new Error(`Invalid credentials. Use ${validEmail} / ${validPassword}`);
      }

      const user = makeBypassUser(email);
      setBypassStoredUser(user);
      setState({ user, isAuthenticated: true, isLoading: false });
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setState((s) => ({ ...s, isLoading: false }));
      throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState((s) => ({ ...s, isLoading: false }));
      throw error;
    }
    if (data.user) {
      setState({ user: toAppUser(data.user), isAuthenticated: true, isLoading: false });
    }
  }, [bypassMode]);

  const signup = useCallback(async (email: string, password: string, artistName: string) => {
    setState((s) => ({ ...s, isLoading: true }));

    if (bypassMode) {
      const user = makeBypassUser(email);
      setBypassStoredUser(user);
      setState({ user, isAuthenticated: true, isLoading: false });
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setState((s) => ({ ...s, isLoading: false }));
      throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { artist_name: artistName } },
    });
    if (error) {
      setState((s) => ({ ...s, isLoading: false }));
      throw error;
    }
    if (data.user) {
      setState({ user: toAppUser(data.user), isAuthenticated: true, isLoading: false });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, [bypassMode]);

  const logout = useCallback(async () => {
    if (bypassMode) {
      clearBypassStoredUser();
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, [bypassMode]);

  const updateUser = useCallback((data: Partial<User>) => {
    if (!state.user) return;
    const updatedUser = { ...state.user, ...data };
    setState((s) => ({ ...s, user: updatedUser }));
    if (bypassMode) {
      setBypassStoredUser(updatedUser);
    }
  }, [state.user, bypassMode]);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, updateUser, isBypassMode: bypassMode }}>{children}</AuthContext.Provider>
  );
};

function toAppUser(supaUser: { id: string; email?: string; user_metadata?: any }): User {
  const artistName =
    supaUser.user_metadata?.artist_name ||
    (supaUser.email ? supaUser.email.split('@')[0] : 'Artist');
  const rawRole = supaUser.user_metadata?.role as string;
  const VALID_ROLES = ['admin', 'artist', 'manager', 'ARTIST', 'INFLUENCER', 'DJ', 'LABEL'];
  const role = VALID_ROLES.includes(rawRole) ? rawRole as User['role'] : 'artist';
  return {
    id: supaUser.id,
    email: supaUser.email ?? '',
    artistName,
    role,
    avatar:
      supaUser.user_metadata?.avatar_url ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${artistName}`,
  };
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
