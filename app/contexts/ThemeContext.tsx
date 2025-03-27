'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { userProfile } = useUser();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Initialize theme from user settings or system preference
    const savedTheme = userProfile?.settings?.theme as Theme;
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(savedTheme || systemPreference);

    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme, userProfile?.settings?.theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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