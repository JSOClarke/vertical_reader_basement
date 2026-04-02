import React from 'react';
import { ReaderView } from './ReaderView';
import { NavArrows } from './NavArrows';
import { useReaderState } from '../hooks/useReaderState';
import { useScrollCenter } from '../hooks/useScrollCenter';
import type { ReaderProps } from '../../../types';

export const ReaderContainer: React.FC<ReaderProps> = ({ sentences, activeIndex, onIndexChange, tapToSelect }) => {
  useReaderState(sentences.length, onIndexChange);
  const { assignRef } = useScrollCenter(activeIndex, sentences.length);

  return (
    <>
      <ReaderView
        sentences={sentences}
        activeIndex={activeIndex}
        onIndexChange={onIndexChange}
        tapToSelect={tapToSelect}
        assignRef={assignRef}
      />
      <NavArrows
        activeIndex={activeIndex}
        totalSentences={sentences.length}
        onIndexChange={onIndexChange}
      />
    </>
  );
};

