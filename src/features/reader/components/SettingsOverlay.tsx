import React, { useRef, useEffect } from 'react';
import { SettingsMenu, MenuIcon } from './SettingsMenu';
import type { SettingsMenuProps } from './SettingsMenu';
import { IconButton } from '../../../components/ui/IconButton';

interface SettingsOverlayProps extends SettingsMenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isMobile: boolean;
  t: any;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  isMobile,
  t,
  ...menuProps
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  return (
    <div 
      ref={menuRef}
      style={{
        position: 'fixed',
        top: isMobile ? '15px' : '30px',
        left: isMobile ? '15px' : '30px',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        opacity: !isMobile && !mobileMenuOpen ? 0.3 : 1,
        transition: 'opacity 0.3s ease'
      }}
      onMouseEnter={e => { if (!isMobile) e.currentTarget.style.opacity = '1'; }}
      onMouseLeave={e => { if (!isMobile && !mobileMenuOpen) e.currentTarget.style.opacity = '0.3'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <IconButton 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          active={mobileMenuOpen}
        >
          <MenuIcon open={mobileMenuOpen} />
        </IconButton>
        {!isMobile && (
          <img 
            src="/favicon.png" 
            alt="Tateyomi" 
            style={{ 
              width: '40px', 
              height: '40px', 
              boxShadow: 'var(--btn-shadow)', 
              cursor: 'default' 
            }} 
          />
        )}
      </div>

      {mobileMenuOpen && (
        <div style={{
          marginTop: '8px',
          background: 'var(--btn-bg)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: '220px',
          maxHeight: isMobile ? 'calc(100vh - 80px)' : 'calc(100vh - 100px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          paddingBottom: '10px',
          animation: 'fadeSlideDown 0.3s ease-out forwards',
          border: '1px solid rgba(128,128,128,0.1)',
          position: 'relative',
          zIndex: 3001
        }}>
          <SettingsMenu setMobileMenuOpen={setMobileMenuOpen} {...menuProps} />
          
          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(128,128,128,0.1)' }}>
            <button 
              onClick={() => { 
                if (window.confirm(t.confirmReset)) { 
                  localStorage.clear(); 
                  window.location.reload(); 
                } 
              }} 
              style={{ 
                width: '100%', 
                padding: '12px 24px', 
                background: 'transparent', 
                border: 'none', 
                color: '#ff4b4b', 
                cursor: 'pointer', 
                fontSize: '14px', 
                textAlign: 'left', 
                fontFamily: "'Inter', 'system-ui', sans-serif" 
              }}
            >
              {t.resetReader}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
