import React from 'react';
import { Sentence } from './Sentence';
import styles from './Reader.module.css';
import type { ReaderProps } from '../../../types';

interface ReaderViewProps extends ReaderProps {
  assignRef: (index: number) => (el: HTMLDivElement | null) => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  sentences,
  activeIndex,
  onIndexChange,
  assignRef
}) => {
  return (
    <div className={styles.readerContainer}>
      <div className={styles.sentencesWrapper}>
        {sentences.map((text, idx) => (
          <Sentence
            key={idx}
            ref={assignRef(idx)}
            text={text}
            isActive={idx === activeIndex}
            onClick={() => onIndexChange(idx)}
          />
        ))}
      </div>
    </div>
  );
};
