import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'forest';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('trooi-landing-theme');
      return stored === 'forest' ? 'forest' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const color = theme === 'forest' ? '#102a20' : '#eef3e9';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
    
    try {
      localStorage.setItem('trooi-landing-theme', theme);
    } catch {}

    document.dispatchEvent(new CustomEvent('trooi:theme-change', { 
      detail: { theme } 
    }));
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'forest' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
