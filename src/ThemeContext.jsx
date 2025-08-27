import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext({ mode: 'light', toggle: () => {} });

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggle = useCallback(() => setMode(m => (m === 'light' ? 'dark' : 'light')), []);

  return <ThemeContext.Provider value={{ mode, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
