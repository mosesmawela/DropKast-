import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'dark' | 'light';
export type VisualStyle = 'default' | 'neumorphism' | 'material' | 'brutalism' | 'skeuomorphism' | 'minimalist' | 'glassmorphism';
export type Vibe = 'LVRN_GREEN' | 'TECHNICAL_ORANGE' | 'NEON_PINK' | 'CYBER_BLUE' | 'MONO_WHITE';
export type UserRole = 'ARTIST' | 'INFLUENCER' | 'DJ';

const VIBE_COLORS: Record<Vibe, { hex: string; rgb: string }> = {
  LVRN_GREEN: { hex: '#acec00', rgb: '172, 236, 0' },
  TECHNICAL_ORANGE: { hex: '#FF4D00', rgb: '255, 77, 0' },
  NEON_PINK: { hex: '#ff00ff', rgb: '255, 0, 255' },
  CYBER_BLUE: { hex: '#00f2ff', rgb: '0, 242, 255' },
  MONO_WHITE: { hex: '#ffffff', rgb: '255, 255, 255' }
};

interface ThemeContextType {
  theme: Theme;
  visualStyle: VisualStyle;
  vibe: Vibe;
  role: UserRole;
  toggleTheme: () => void;
  setVisualStyle: (style: VisualStyle) => void;
  setVibe: (vibe: Vibe) => void;
  setRole: (role: UserRole) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('campaign-os-theme');
    return (saved as Theme) || 'dark';
  });

  const [visualStyle, setVisualStyleState] = useState<VisualStyle>(() => {
    const saved = localStorage.getItem('campaign-os-visual-style');
    return (saved as VisualStyle) || 'neumorphism';
  });

  const [vibe, setVibeState] = useState<Vibe>(() => {
    const saved = localStorage.getItem('campaign-os-vibe');
    return (saved as Vibe) || 'TECHNICAL_ORANGE';
  });

  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('campaign-os-role');
    return (saved as UserRole) || 'ARTIST';
  });

  useEffect(() => {
    // Reset all theme classes
    const html = document.documentElement;
    const styleClasses = [
      'theme-neumorphism', 
      'theme-material', 
      'theme-brutalism', 
      'theme-skeuomorphism', 
      'theme-minimalist', 
      'theme-glassmorphism'
    ];
    html.classList.remove('light', ...styleClasses);
    
    // Add current tone
    if (theme === 'light') html.classList.add('light');
    
    // Add current style
    if (visualStyle !== 'default') {
      html.classList.add(`theme-${visualStyle}`);
    }

    // Apply Vibe
    const vibeData = VIBE_COLORS[vibe];
    html.style.setProperty('--color-primary', vibeData.hex);
    html.style.setProperty('--primary-raw', vibeData.rgb);

    localStorage.setItem('campaign-os-theme', theme);
    localStorage.setItem('campaign-os-visual-style', visualStyle);
    localStorage.setItem('campaign-os-vibe', vibe);
    localStorage.setItem('campaign-os-role', role);
  }, [theme, visualStyle, vibe, role]);

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transitioning');
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 800);
  };

  const setVisualStyle = (style: VisualStyle) => {
    document.documentElement.classList.add('theme-transitioning');
    setVisualStyleState(style);
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 800);
  };

  const setVibe = (v: Vibe) => {
    document.documentElement.classList.add('theme-transitioning');
    setVibeState(v);
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 800);
  };

  const setRole = (r: UserRole) => {
    setRoleState(r);
  };

  return (
    <ThemeContext.Provider value={{ theme, visualStyle, vibe, role, toggleTheme, setVisualStyle, setVibe, setRole }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
