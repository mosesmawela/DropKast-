import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, artistName: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check localStorage on mount
    const storedUser = localStorage.getItem('sw_user');
    if (storedUser) {
      setState({
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (email: string, artistName: string) => {
    setState(s => ({ ...s, isLoading: true }));
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      email,
      artistName,
      role: 'artist',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${artistName}`,
    };

    localStorage.setItem('sw_user', JSON.stringify(newUser));
    setState({
      user: newUser,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('sw_user');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateUser = (data: Partial<User>) => {
    if (!state.user) return;
    const updatedUser = { ...state.user, ...data };
    localStorage.setItem('sw_user', JSON.stringify(updatedUser));
    setState(s => ({ ...s, user: updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
