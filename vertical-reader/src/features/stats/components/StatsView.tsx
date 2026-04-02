import React from 'react';
import type { UserStats } from '../../../types';

interface StatsViewProps {
  stats: UserStats;
  onClose: () => void;
  t: any;
}

export const StatsView: React.FC<StatsViewProps> = ({ stats, onClose, t }) => {
  const { totalCharactersRead, readingDays } = stats;
  const totalDays = readingDays.length;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-color)',
      zIndex: 3000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'inherit',
      transition: 'background-color 0.4s ease, color 0.4s ease',
    }}>
      <div style={{
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
      }}>
        <h1 style={{ 
          fontSize: '1.2rem', 
          opacity: 0.6, 
          letterSpacing: '2px', 
          textTransform: 'uppercase',
          margin: 0 
        }}>
          {t.statsTitle}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '3.5rem', fontWeight: 300, color: 'var(--text-highlight)' }}>
              {totalCharactersRead.toLocaleString()}
            </div>
            <div style={{ opacity: 0.5, fontSize: '0.9rem' }}>{t.charactersRead}</div>
          </div>

          <div>
            <div style={{ fontSize: '3.5rem', fontWeight: 300, color: 'var(--text-highlight)' }}>
              {totalDays}
            </div>
            <div style={{ opacity: 0.5, fontSize: '0.9rem' }}>{t.daysRead}</div>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{
            background: 'var(--btn-bg)',
            color: 'var(--btn-text)',
            border: 'none',
            padding: '15px 30px',
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '20px',
            boxShadow: 'var(--btn-shadow)',
            transition: 'opacity 0.2s ease',
            fontFamily: 'sans-serif',
            fontWeight: 600,
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {t.backToReader}
        </button>
      </div>
    </div>
  );
};
