import React from 'react';
import { BookInfo } from './BookInfo';
import { ProgressBar } from './ProgressBar';
import { TranslationPanel } from './TranslationPanel';
import { useProfileStore } from '../../profile/store/useProfileStore';
import { useBookStore } from '../store/useBookStore';

interface BottomHUDProps {
  isMobile?: boolean;
  onOpenJump: () => void;
}

/**
 * Main HUD component for the reader.
 * Refactored in Phase 4 to be autonomous and minimize prop-drilling.
 */
export const BottomHUD: React.FC<BottomHUDProps> = React.memo(({ 
  isMobile = false, 
  onOpenJump,
}) => {
  // High-performance atomic selectors
  const activeIndex = useProfileStore(state => state.activeIndex);
  const sentences = useBookStore(state => state.sentences);
  const metadata = useBookStore(state => state.metadata);

  const activeSentence = sentences[activeIndex] || '';

  return (
    <>
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
          <BookInfo metadata={metadata} isMobile={isMobile} />
          {!isMobile && <ProgressBar sentences={sentences} activeIndex={activeIndex} onOpenJump={onOpenJump} />}
        </div>

        <TranslationPanel 
          activeSentence={activeSentence} 
          isMobile={isMobile} 
        />
      </div>
    </>
  );
});
