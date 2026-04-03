import React from 'react';
import { ReaderView } from './ReaderView';
import { useReaderState } from '../hooks/useReaderState';
import { useScrollCenter } from '../hooks/useScrollCenter';
import type { ReaderProps } from '../../../types';

export const ReaderContainer: React.FC<ReaderProps> = ({ sentences, activeIndex, onIndexChange, tapToSelect, showArrows, centerActive, minedSentences, bookmarks, onOpenJump, orientation }) => {
  useReaderState(sentences.length, onIndexChange);
  const { assignRef } = useScrollCenter(activeIndex, sentences.length, centerActive, orientation);

  return (
    <ReaderView
      sentences={sentences}
      activeIndex={activeIndex}
      onIndexChange={onIndexChange}
      tapToSelect={tapToSelect}
      showArrows={showArrows}
      assignRef={assignRef}
      centerActive={centerActive}
      minedSentences={minedSentences}
      bookmarks={bookmarks}
      onOpenJump={onOpenJump}
      orientation={orientation}
    />
  );
};

