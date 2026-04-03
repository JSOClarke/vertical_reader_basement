import React, { useCallback } from 'react';
import { Sentence } from './Sentence';
import { NavArrows } from './NavArrows';
import { useSwipe } from '../../../hooks/useSwipe';
import styles from './Reader.module.css';
import type { ReaderProps } from '../../../types';

interface ReaderViewProps extends ReaderProps {
  assignRef: (index: number) => (el: HTMLDivElement | null) => void;
}

export const ReaderView: React.FC<ReaderViewProps> = React.memo(({
  sentences,
  activeIndex,
  onIndexChange,
  tapToSelect,
  showArrows,
  centerActive,
  minedSentences,
  bookmarks,
  orientation,
  assignRef
}) => {
  const goNext = useCallback(() => {
    onIndexChange((prev: number) => Math.min(prev + 1, sentences.length - 1));
  }, [onIndexChange, sentences.length]);

  const goPrev = useCallback(() => {
    onIndexChange((prev: number) => Math.max(prev - 1, 0));
  }, [onIndexChange]);

  // Swipe logic: axis matches orientation (X for vertical-rl, Y for horizontal-tb)
  const { onTouchStart, onTouchEnd } = useSwipe(goPrev, goNext, orientation === 'vertical' ? 'x' : 'y');

  return (
    <div
      className={`${styles.readerContainer} ${!centerActive ? styles.noCentering : ''} ${orientation === 'horizontal' ? styles.horizontal : ''}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className={styles.sentencesWrapper}>
        {sentences.map((text, idx) => (
          <Sentence
            key={idx}
            ref={assignRef(idx)}
            text={text}
            isMined={minedSentences?.has(text)}
            isBookmarked={bookmarks?.includes(idx)}
            isActive={idx === activeIndex}
            onClick={() => onIndexChange(idx)}
            tapToSelect={tapToSelect}
          />
        ))}
      </div>

      {showArrows && (
        <NavArrows
          activeIndex={activeIndex}
          totalSentences={sentences.length}
          onIndexChange={onIndexChange}
        />
      )}
    </div>
  );
});


