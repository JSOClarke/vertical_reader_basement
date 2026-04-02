import React from 'react';
import { BookInfo } from './BookInfo';
import { ProgressBar } from './ProgressBar';
import { TranslationPanel } from './TranslationPanel';
import type { BookMetadata } from '../../../types';

interface BottomHUDProps {
  metadata?: BookMetadata;
  sentences: string[];
  activeIndex: number;
  isMobile?: boolean;
  ankiField?: string;
}

export const BottomHUD: React.FC<BottomHUDProps> = ({ metadata, sentences, activeIndex, isMobile = false, ankiField = '' }) => {
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
          <ProgressBar sentences={sentences} activeIndex={activeIndex} />
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
          {!isMobile && <ProgressBar sentences={sentences} activeIndex={activeIndex} />}
        </div>

        <TranslationPanel activeSentence={activeSentence} isMobile={isMobile} metadata={metadata} ankiField={ankiField} />
      </div>
    </>
  );
};
