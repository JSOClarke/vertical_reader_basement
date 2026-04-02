import React, { useState } from 'react';
import { BookInfo } from './BookInfo';
import { ProgressBar } from './ProgressBar';
import { TranslationPanel } from './TranslationPanel';
import type { BookMetadata } from '../../../types';

interface BottomHUDProps {
  metadata?: BookMetadata;
  sentences: string[];
  activeIndex: number;
  isMobile?: boolean; // NEW HOOK DELEGATION
  showExtraUI?: boolean;
}

export const BottomHUD: React.FC<BottomHUDProps> = ({ metadata, sentences, activeIndex, isMobile = false, showExtraUI = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const activeSentence = sentences[activeIndex] || '';

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: isMobile ? '15px' : '30px',
        left: isMobile ? '15px' : '30px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '20px' : '40px', 
        alignItems: isMobile ? 'flex-start' : 'flex-end',
        maxWidth: isMobile ? '95vw' : '90vw',
        opacity: isHovered || isMobile ? 1 : 0.4, // Keep totally opaque on mobile as hover is useless on touch
        transition: 'opacity 0.3s ease'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        {showExtraUI && <BookInfo metadata={metadata} />}
        <ProgressBar sentences={sentences} activeIndex={activeIndex} />
      </div>

      <TranslationPanel activeSentence={activeSentence} isMobile={isMobile} />
    </div>
  );
};
