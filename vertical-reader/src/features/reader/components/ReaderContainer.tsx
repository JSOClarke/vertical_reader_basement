import React from 'react';
import { ReaderView } from './ReaderView';
import { useReaderState } from '../hooks/useReaderState';
import { useScrollCenter } from '../hooks/useScrollCenter';
import type { ReaderProps } from '../../../types';

export const ReaderContainer: React.FC<ReaderProps> = ({ sentences, activeIndex, onIndexChange }) => {
  useReaderState(sentences.length, onIndexChange);
  const { assignRef } = useScrollCenter(activeIndex, sentences.length);

  return (
    <ReaderView
      sentences={sentences}
      activeIndex={activeIndex}
      onIndexChange={onIndexChange}
      assignRef={assignRef}
    />
  );
};
