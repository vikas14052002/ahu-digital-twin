import { useState, useEffect, useCallback, createContext, useContext } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContext {
  theme: Theme;
  toggle: () => void;
}

export const ThemeCtx = createContext<ThemeContext>({
  theme: 'dark',
  toggle: () => {},
});

export function useThemeProvider(): ThemeContext {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('ahu-theme');
    return (stored as Theme) ?? 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ahu-theme', theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggle };
}

export function useTheme() {
  return useContext(ThemeCtx);
}
