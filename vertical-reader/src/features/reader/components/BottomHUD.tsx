import React, { useState } from 'react';
import { BookInfo } from './BookInfo';
import { ProgressBar } from './ProgressBar';
import { TranslationPanel } from './TranslationPanel';
import type { BookMetadata } from '../../../types';

interface BottomHUDProps {
  metadata?: BookMetadata;
  sentences: string[];
  activeIndex: number;
}

export const BottomHUD: React.FC<BottomHUDProps> = ({ metadata, sentences, activeIndex }) => {
  const [isHovered, setIsHovered] = useState(false);
  const activeSentence = sentences[activeIndex] || '';

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '30px',
        left: '30px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'row',
        gap: '40px', 
        alignItems: 'flex-end',
        maxWidth: '90vw',
        opacity: isHovered ? 1 : 0.4,
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
        <BookInfo metadata={metadata} />
        <ProgressBar sentences={sentences} activeIndex={activeIndex} />
      </div>

      <TranslationPanel activeSentence={activeSentence} />
    </div>
  );
};
