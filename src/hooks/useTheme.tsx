import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'forest';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Load theme từ localStorage
    try {
      const saved = localStorage.getItem('trooi-landing-theme');
      if (saved === 'forest' || saved === 'light') {
        setTheme(saved);
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  useEffect(() => {
    // Apply theme
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'forest' ? '#102a20' : '#e7ede1');
    }

    // Dispatch event cho Three.js scenes
    document.dispatchEvent(
      new CustomEvent('trooi:theme-change', { detail: { theme } })
    );
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'forest' ? 'light' : 'forest';
    setTheme(newTheme);
    try {
      localStorage.setItem('trooi-landing-theme', newTheme);
    } catch (e) {
      // Ignore
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
