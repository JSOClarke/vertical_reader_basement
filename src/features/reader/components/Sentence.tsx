import { forwardRef } from 'react';
import styles from './Reader.module.css';
import type { SentenceProps } from '../../../types';

export const Sentence = forwardRef<HTMLDivElement, SentenceProps>(
  ({ text, isActive, isMined, isBookmarked, onClick, tapToSelect }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.sentence} ${isActive ? styles.active : ''} ${!tapToSelect ? styles.noTap : ''}`}
        onClick={tapToSelect ? onClick : undefined}
      >
        {isMined && <div className={styles.minedIndicator} />}
        {isBookmarked && <div className={styles.bookmarkIndicator} />}
        {text}
      </div>
    );
  }
);

Sentence.displayName = 'Sentence';

