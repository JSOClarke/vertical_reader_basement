import React from 'react';
import type { BookMetadata } from '../../../types';
import type { ReaderActions } from '../hooks/useReaderActions';

const TranslateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8l6 6" />
    <path d="M4 14l6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="M22 22l-5-10-5 10" />
    <path d="M14 18h6" />
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const AnkiIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" />
    <path d="M12 8v8" />
    <path d="M8 12h8" />
  </svg>
);

const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);


interface TranslationPanelProps {
  activeSentence: string;
  isMobile?: boolean;
  metadata?: BookMetadata;
  ankiField?: string;
  onAnkiMine: (sentence: string) => void;
  isBookmarked: boolean;
  readerActions: ReaderActions;
  t: any;
}

export const TranslationPanel: React.FC<TranslationPanelProps> = ({ 
  activeSentence, 
  isMobile = false, 
  metadata, 
  ankiField = '', 
  onAnkiMine,
  isBookmarked,
  readerActions,
  t 
}) => {
  const { translation, loading, ankiLoading, toast, translate, copy, mineAnki, toggleBookmark } = readerActions;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => translate(activeSentence)}
            title={t.translateTooltip}
            style={{
              background: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              padding: '8px 12px',
              borderRadius: '0', 
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: 'var(--btn-shadow)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.4,
              transition: 'opacity 0.3s ease, background 0.3s, color 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
            disabled={loading}
          >
            <div style={{ 
              animation: loading ? 'spin 1s linear infinite' : 'none', 
              display: 'flex', 
              alignItems: 'center' 
            }}>
              <TranslateIcon />
            </div>
          </button>
  
          <button 
            onClick={() => copy(activeSentence, t)}
            title={t.copyTooltip}
            style={{
              background: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              padding: '8px 12px',
              borderRadius: '0', 
              cursor: 'pointer',
              boxShadow: 'var(--btn-shadow)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.4,
              transition: 'opacity 0.3s ease, background 0.3s, color 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
          >
            <CopyIcon />
          </button>

          <button 
            onClick={() => toggleBookmark()}
            title={t.bookmarkTooltip}
            style={{
              background: 'var(--btn-bg)',
              color: isBookmarked ? '#f59e0b' : 'var(--btn-text)',
              padding: '8px 12px',
              borderRadius: '0', 
              cursor: 'pointer',
              boxShadow: 'var(--btn-shadow)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isBookmarked ? 1 : 0.4,
              transition: 'opacity 0.3s ease, background 0.3s, color 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = isBookmarked ? '1' : '0.4'}
          >
            <BookmarkIcon filled={isBookmarked} />
          </button>

          {!isMobile && (
            <button 
              onClick={() => mineAnki(activeSentence, metadata, ankiField, onAnkiMine, t)}
              title={t.ankiTooltip}
              style={{
                background: 'var(--btn-bg)',
                color: 'var(--btn-text)',
                padding: '8px 12px',
                borderRadius: '0', 
                cursor: ankiLoading ? 'wait' : 'pointer',
                boxShadow: 'var(--btn-shadow)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.4,
                transition: 'opacity 0.3s ease, background 0.3s, color 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
              disabled={ankiLoading}
            >
              <div style={{ 
                animation: ankiLoading ? 'spin 1s linear infinite' : 'none', 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <AnkiIcon />
              </div>
            </button>
          )}
        </div>

        {translation && (
          <div style={{
            color: 'var(--text-color)',
            fontSize: '14px',
            lineHeight: 1.6,
            fontFamily: 'sans-serif',
            borderLeft: '2px solid var(--text-highlight)',
            paddingLeft: '15px',
            maxWidth: isMobile ? '80vw' : '500px',
            animation: 'fadeSlideRight 0.4s ease-out forwards'
          }}>
            <p style={{ margin: 0, opacity: 0.9, textShadow: 'var(--text-shadow)' }}>{translation}</p>
          </div>
        )}
      </div>

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--btn-bg)',
          color: 'var(--btn-text)',
          padding: '10px 20px',
          borderRadius: '0',
          borderLeft: `3px solid ${toast.type === 'success' ? '#4caf50' : '#ef5350'}`,
          boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
          zIndex: 9999,
          fontSize: '14px',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          animation: 'fadeSlideUpToast 0.3s ease-out forwards'
        }}>
          {toast.message}
        </div>
      )}
    </>
  );
};
