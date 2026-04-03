import React from 'react';
import { useProfileStore } from '../../profile/store/useProfileStore';

interface StatsViewProps {
  onClose: () => void;
  t: any;
}

export const StatsView: React.FC<StatsViewProps> = ({ onClose, t }) => {
  const stats = useProfileStore(state => state.stats);
  const { totalCharactersRead, readingDays, miningHistory = [] } = stats;
  const totalDays = readingDays.length;
  const totalMined = miningHistory.length;

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
      overflowY: 'auto',
      padding: '40px 0',
    }}>
      <div style={{
        maxWidth: '600px',
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '3rem', fontWeight: 300, color: 'var(--text-highlight)' }}>
              {totalCharactersRead.toLocaleString()}
            </div>
            <div style={{ opacity: 0.5, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.charactersRead}</div>
          </div>

          <div>
            <div style={{ fontSize: '3rem', fontWeight: 300, color: 'var(--text-highlight)' }}>
              {totalDays}
            </div>
            <div style={{ opacity: 0.5, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.daysRead}</div>
          </div>

          <div>
            <div style={{ fontSize: '3rem', fontWeight: 300, color: 'var(--text-highlight)' }}>
              {totalMined}
            </div>
            <div style={{ opacity: 0.5, fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.totalCardsMined}</div>
          </div>
        </div>

        {/* Mining History List */}
        <div style={{ textAlign: 'left', marginTop: '20px' }}>
          <h2 style={{ fontSize: '1rem', opacity: 0.6, marginBottom: '15px', borderBottom: '1px solid rgba(128,128,128,0.2)', paddingBottom: '10px' }}>
            {t.recentMinedCards}
          </h2>
          
          <div style={{ 
            maxHeight: '30vh', 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '15px',
            paddingRight: '10px'
          }}>
            {miningHistory.length > 0 ? miningHistory.map((entry, i) => (
              <div key={i} style={{ fontSize: '0.9rem', borderLeft: '2px solid var(--text-highlight)', paddingLeft: '15px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem', opacity: 0.7, marginBottom: '4px' }}>
                  {entry.bookTitle} • {new Date(entry.timestamp).toLocaleDateString()}
                </div>
                <div style={{ lineHeight: 1.4 }}>{entry.sentence}</div>
              </div>
            )) : (
              <div style={{ opacity: 0.5, fontSize: '0.9rem', fontStyle: 'italic' }}>{t.noHistory}</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={onClose}
            style={{
              background: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              border: 'none',
              padding: '15px 30px',
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '10px',
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
    </div>
  );
};
