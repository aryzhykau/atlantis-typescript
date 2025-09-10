import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from '@mui/material';
import { lightTheme, darkTheme } from './ai-theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeModeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggleMode: () => void; // toggles between light/dark (if system -> sets to opposite of effective)
  effectiveTheme: typeof lightTheme;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

const STORAGE_KEY = 'themeMode';

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === 'light' || raw === 'dark' || raw === 'system') return raw as ThemeMode;
    } catch (e) {
      // ignore
    }
    return 'system';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      // ignore
    }
  }, [mode]);

  const setMode = (m: ThemeMode) => setModeState(m);

  const toggleMode = () => {
    // When in system mode, toggle should set explicit opposite of current effective
    const effectiveIsDark = mode === 'system' ? prefersDark : mode === 'dark';
    setModeState(effectiveIsDark ? 'light' : 'dark');
  };

  const effectiveTheme = useMemo(() => {
    const useDark = mode === 'system' ? prefersDark : mode === 'dark';
    return useDark ? darkTheme : lightTheme;
  }, [mode, prefersDark]);

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, toggleMode, effectiveTheme }}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}

export default ThemeModeProvider;
