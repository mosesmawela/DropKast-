import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { getSupabase } from '../lib/supabase';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, artistName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Bootstrap: check Supabase session
  useEffect(() => {
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

    // No Supabase configured - require proper auth setup
    setState((s) => ({ ...s, isLoading: false }));
  }, []);

  const login = async (email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true }));
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
  };

  const signup = async (email: string, password: string, artistName: string) => {
    setState((s) => ({ ...s, isLoading: true }));
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
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const updateUser = (data: Partial<User>) => {
    if (!state.user) return;
    const updatedUser = { ...state.user, ...data };
    setState((s) => ({ ...s, user: updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, updateUser }}>{children}</AuthContext.Provider>
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
