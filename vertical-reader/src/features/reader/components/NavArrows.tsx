import React from 'react';
import styles from './NavArrows.module.css';

interface NavArrowsProps {
  activeIndex: number;
  totalSentences: number;
  onIndexChange: (index: number) => void;
}

export const NavArrows: React.FC<NavArrowsProps> = ({ activeIndex, totalSentences, onIndexChange }) => {
  // In vertical-rl, reading flows right→left, so:
  //   Right arrow = go back (prev sentence)
  //   Left arrow  = go forward (next sentence)
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < totalSentences - 1;

  return (
    <>
      {/* Right edge = go to previous sentence */}
      <button
        id="nav-arrow-prev"
        className={`${styles.navArrow} ${styles.right}`}
        onClick={() => onIndexChange(Math.max(activeIndex - 1, 0))}
        disabled={!canGoPrev}
        aria-label="Previous sentence"
      >
        ›
      </button>

      {/* Left edge = go to next sentence */}
      <button
        id="nav-arrow-next"
        className={`${styles.navArrow} ${styles.left}`}
        onClick={() => onIndexChange(Math.min(activeIndex + 1, totalSentences - 1))}
        disabled={!canGoNext}
        aria-label="Next sentence"
      >
        ‹
      </button>
    </>
  );
};
