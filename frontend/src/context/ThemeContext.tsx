import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ThemeColors {
  name: string;
  primary: string; // HSL values: "hue saturation% lightness%"
  secondary: string;
  accent: string;
  sidebarPrimary: string;
}

export const predefinedThemes: ThemeColors[] = [
  {
    name: 'Matrix Red',
    primary: '0 85% 55%',
    secondary: '220 70% 55%',
    accent: '200 100% 60%',
    sidebarPrimary: '0 85% 55%',
  },
  {
    name: 'Electric Blue',
    primary: '210 100% 50%',
    secondary: '240 100% 60%',
    accent: '180 100% 50%',
    sidebarPrimary: '210 100% 50%',
  },
  {
    name: 'Neon Green',
    primary: '120 100% 50%',
    secondary: '150 100% 45%',
    accent: '90 100% 50%',
    sidebarPrimary: '120 100% 50%',
  },
  {
    name: 'Purple Power',
    primary: '270 80% 60%',
    secondary: '280 70% 65%',
    accent: '260 90% 55%',
    sidebarPrimary: '270 80% 60%',
  },
  {
    name: 'Orange Energy',
    primary: '25 100% 55%',
    secondary: '35 100% 50%',
    accent: '15 100% 60%',
    sidebarPrimary: '25 100% 55%',
  },
  {
    name: 'Cyan Flow',
    primary: '180 100% 50%',
    secondary: '200 100% 60%',
    accent: '160 100% 45%',
    sidebarPrimary: '180 100% 50%',
  },
  {
    name: 'Pink Passion',
    primary: '330 80% 60%',
    secondary: '340 75% 65%',
    accent: '320 85% 55%',
    sidebarPrimary: '330 80% 60%',
  },
  {
    name: 'Gold Premium',
    primary: '45 100% 50%',
    secondary: '40 100% 55%',
    accent: '50 100% 45%',
    sidebarPrimary: '45 100% 50%',
  },
];

interface ThemeContextType {
  currentTheme: ThemeColors;
  setTheme: (theme: ThemeColors) => void;
  themes: ThemeColors[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentThemeState] = useState<ThemeColors>(() => {
    // Load from localStorage or use default
    const saved = localStorage.getItem('gym-theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch {
        return predefinedThemes[0];
      }
    }
    return predefinedThemes[0];
  });

  const setTheme = (theme: ThemeColors) => {
    setCurrentThemeState(theme);
    localStorage.setItem('gym-theme', JSON.stringify(theme));
    applyTheme(theme);
  };

  const applyTheme = (theme: ThemeColors) => {
    const root = document.documentElement;
    
    // Update primary colors
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--sidebar-primary', theme.sidebarPrimary);
    root.style.setProperty('--sidebar-ring', theme.sidebarPrimary);
    
    // Update secondary colors
    root.style.setProperty('--secondary', theme.secondary);
    
    // Update accent colors
    root.style.setProperty('--accent', theme.accent);
    
    // Update gradients
    root.style.setProperty(
      '--gradient-primary',
      `linear-gradient(135deg, hsl(${theme.primary}), hsl(${theme.primary.replace(/\d+%/, '40%')}))`
    );
    root.style.setProperty(
      '--gradient-accent',
      `linear-gradient(135deg, hsl(${theme.accent}), hsl(${theme.secondary}))`
    );
    
    // Update shadows with theme color
    const [hue, sat, light] = theme.primary.split(' ');
    root.style.setProperty(
      '--shadow-glow-red',
      `0 0 30px hsla(${hue}, ${sat}, ${light}, 0.4)`
    );
    
    // Update input glow
    const inputGlowColor = `hsla(${hue}, ${sat}, ${light}, 0.3)`;
    const style = document.createElement('style');
    style.id = 'theme-dynamic-styles';
    style.textContent = `
      .input-glow:focus {
        box-shadow: 0 0 20px ${inputGlowColor};
      }
    `;
    const existing = document.getElementById('theme-dynamic-styles');
    if (existing) {
      existing.remove();
    }
    document.head.appendChild(style);
  };

  useEffect(() => {
    applyTheme(currentTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes: predefinedThemes }}>
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

