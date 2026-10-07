import { useTheme } from '../hooks/useTheme';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header>
      <a className="brand" href="#start" aria-label="Trọ Ơi, về đầu trang">
        <img src="/trooi-logo-main.png" alt="Trọ Ơi" height="42" />
      </a>
      
      <div className="header-actions">
        <button
          id="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'forest' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          title={theme === 'forest' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          aria-pressed={theme === 'forest'}
        >
          <span className="theme-light" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2v2m0 12v2M4.93 4.93l1.41 1.41m7.32 7.32l1.41 1.41M2 10h2m12 0h2M4.93 15.07l1.41-1.41m7.32-7.32l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </span>
          <span className="theme-dark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 10.5A7 7 0 018.5 3a7 7 0 109.5 7.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
            </svg>
          </span>
        </button>
        
        <a className="header-cta" href="#app">
          Gặp Trọ Ơi <span>↗</span>
        </a>
      </div>
    </header>
  );
}
