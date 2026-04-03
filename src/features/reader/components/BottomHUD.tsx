import React from 'react';
import { BookInfo } from './BookInfo';
import { ProgressBar } from './ProgressBar';
import { TranslationPanel } from './TranslationPanel';
import type { BookMetadata } from '../../../types';

import type { ReaderActions } from '../hooks/useReaderActions';

interface BottomHUDProps {
  metadata?: BookMetadata;
  sentences: string[];
  activeIndex: number;
  isMobile?: boolean;
  ankiField?: string;
  onAnkiMine: (sentence: string) => void;
  onOpenJump: () => void;
  isBookmarked?: boolean;
  readerActions: ReaderActions;
  t: any;
  onOpenLibrary: () => void;
}

export const BottomHUD: React.FC<BottomHUDProps> = React.memo(({ 
  metadata, 
  sentences, 
  activeIndex, 
  isMobile = false, 
  ankiField = '',
  onAnkiMine,
  onOpenJump,
  isBookmarked = false,
  readerActions,
  t,
  onOpenLibrary
}) => {
  const activeSentence = sentences[activeIndex] || '';

  return (
    <>
      {/* Mobile: progress bar at the top */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: '15px',
          left: '15px',
          zIndex: 1000,
        }}>
          <ProgressBar sentences={sentences} activeIndex={activeIndex} onOpenJump={onOpenJump} />
        </div>
      )}

      {/* Bottom HUD */}
      <div 
        style={{
          position: 'fixed',
          bottom: isMobile ? '15px' : '30px',
          left: isMobile ? '15px' : '30px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '15px' : '40px', 
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          maxWidth: isMobile ? '95vw' : '90vw',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <BookInfo metadata={metadata} />
          {!isMobile && <ProgressBar sentences={sentences} activeIndex={activeIndex} onOpenJump={onOpenJump} />}
          <button
            onClick={onOpenLibrary}
            style={{
              background: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              border: 'none',
              padding: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--btn-shadow)',
              opacity: 0.8,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
            aria-label={t.library || "Library"}
            title={t.library || "Library"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </button>
        </div>

        <TranslationPanel 
          activeSentence={activeSentence} 
          isMobile={isMobile} 
          metadata={metadata} 
          ankiField={ankiField}
          onAnkiMine={onAnkiMine}
          isBookmarked={isBookmarked}
          readerActions={readerActions}
          t={t}
        />
      </div>
    </>
  );
});

