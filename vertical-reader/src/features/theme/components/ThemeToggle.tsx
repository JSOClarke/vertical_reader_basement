import React from 'react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isMobile?: boolean;
}

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme, isMobile = false }) => {
  return (
    <button 
      onClick={toggleTheme}
      style={{
        position: isMobile ? 'static' : 'fixed',
        top: isMobile ? undefined : '30px',
        right: isMobile ? undefined : '30px',
        zIndex: 1000,
        background: 'var(--btn-bg)',
        color: 'var(--btn-text)',
        padding: '10px 20px',
        borderRadius: '0',
        cursor: 'pointer',
        boxShadow: 'var(--btn-shadow)',
        fontWeight: 'bold',
        fontSize: '13px',
        border: 'none',
        fontFamily: 'sans-serif',
        opacity: 0.3,
        transition: 'opacity 0.3s ease, background 0.3s, color 0.3s',
        display: 'flex',
        alignItems: 'center'
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
      onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}
    >
      {theme === 'dark' ? <><SunIcon /> Light Mode</> : <><MoonIcon /> Dark Mode</>}
    </button>
  );
};
