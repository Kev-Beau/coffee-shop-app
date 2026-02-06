'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type ThemeName = 'coffee' | 'matcha' | 'chai' | 'black-tea' | 'herbal';

export interface Theme {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    primaryLighter: string;
    accent: string;
    accentHover: string;
  };
}

export const themes: Record<ThemeName, Theme> = {
  coffee: {
    name: 'coffee',
    displayName: 'Coffee',
    colors: {
      primary: '#6F4E37',      // coffee bean brown
      primaryDark: '#4A3728',  // dark roast brown
      primaryLight: '#C4A484', // latte foam
      primaryLighter: '#F2E8D5', // cream
      accent: '#8B6F47',       // medium roast
      accentHover: '#6F4E37',  // coffee bean
    },
  },
  matcha: {
    name: 'matcha',
    displayName: 'Matcha',
    colors: {
      primary: '#7a8b7a',      // olive green
      primaryDark: '#4a5a4a',  // dark olive
      primaryLight: '#b8c9b0', // sage green
      primaryLighter: '#e0d9cc', // pale beige
      accent: '#7d5a3c',       // medium brown
      accentHover: '#4a2c17',  // dark brown
    },
  },
  chai: {
    name: 'chai',
    displayName: 'Chai',
    colors: {
      primary: '#C17030',      // warm cinnamon
      primaryDark: '#8B4513',  // cinnamon stick
      primaryLight: '#F5DEB3', // chai with milk
      primaryLighter: '#FFF8E7', // warm cream
      accent: '#CD5C5C',       // cardamom red
      accentHover: '#A0522D',  // sienna
    },
  },
  'black-tea': {
    name: 'black-tea',
    displayName: 'Black Tea',
    colors: {
      primary: '#991b1b',      // deep red/burgundy
      primaryDark: '#7f1d1d',  // darker burgundy
      primaryLight: '#fee2e2', // light red
      primaryLighter: '#fef2f2', // lighter red
      accent: '#44403c',       // dark gray/brown
      accentHover: '#1c1917',  // almost black
    },
  },
  herbal: {
    name: 'herbal',
    displayName: 'Herbal',
    colors: {
      primary: '#9B8CB8',      // muted lavender
      primaryDark: '#6D5D80',  // muted dark lavender
      primaryLight: '#E8E4F0', // soft lavender
      primaryLighter: '#F5F3F8', // very pale lavender
      accent: '#6B9B8A',       // muted mint/sage
      accentHover: '#4A7A6A',  // darker sage
    },
  },
};

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  currentTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('coffee');
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Get current user
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        // Load theme from user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('theme_preference')
          .eq('id', session.user.id)
          .single();

        if (profile?.theme_preference && themes[profile.theme_preference as ThemeName]) {
          setThemeState(profile.theme_preference as ThemeName);
          localStorage.setItem('theme', profile.theme_preference);
        } else {
          // Fallback to localStorage
          const savedTheme = localStorage.getItem('theme') as ThemeName;
          if (savedTheme && themes[savedTheme]) {
            setThemeState(savedTheme);
          }
        }
      } else {
        // Not logged in, use localStorage
        const savedTheme = localStorage.getItem('theme') as ThemeName;
        if (savedTheme && themes[savedTheme]) {
          setThemeState(savedTheme);
        }
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    if (mounted) {
      // Update CSS variables
      const themeConfig = themes[theme];
      const root = document.documentElement;
      root.style.setProperty('--color-primary', themeConfig.colors.primary);
      root.style.setProperty('--color-primary-dark', themeConfig.colors.primaryDark);
      root.style.setProperty('--color-primary-light', themeConfig.colors.primaryLight);
      root.style.setProperty('--color-primary-lighter', themeConfig.colors.primaryLighter);
      root.style.setProperty('--color-accent', themeConfig.colors.accent);
      root.style.setProperty('--color-accent-hover', themeConfig.colors.accentHover);
    }
  }, [theme, mounted]);

  const setTheme = async (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    // Save to user profile if logged in
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ theme_preference: newTheme })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    }
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentTheme: themes[theme] }}>
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
