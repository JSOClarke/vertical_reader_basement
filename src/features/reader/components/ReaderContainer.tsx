import React, { useMemo } from 'react';
import { ReaderView } from './ReaderView';
import { useReaderState } from '../hooks/useReaderState';
import { useScrollCenter } from '../hooks/useScrollCenter';
import { useProfileStore } from '../../profile/store/useProfileStore';
import { useBookStore } from '../store/useBookStore';

interface ReaderContainerProps {
  onOpenJump: () => void;
}

export const ReaderContainer: React.FC<ReaderContainerProps> = React.memo(({ onOpenJump }) => {
  // High-performance atomic selectors
  const activeIndex = useProfileStore(state => state.activeIndex);
  const setActiveIndex = useProfileStore(state => state.setActiveIndex);
  const tapToSelect = useProfileStore(state => state.tapToSelect);
  const showArrows = useProfileStore(state => state.showArrows);
  const centerActive = useProfileStore(state => state.centerActive);
  const stats = useProfileStore(state => state.stats);

  const sentences = useBookStore(state => state.sentences);
  const metadata = useBookStore(state => state.metadata);

  useReaderState(sentences.length, setActiveIndex);
  const { assignRef } = useScrollCenter(activeIndex, sentences.length, centerActive);

  // Derive mined sentences locally
  const minedSentencesSet = useMemo(() => {
    const currentTitle = metadata?.title || 'Unknown Book';
    const set = new Set<string>();
    if (stats.miningHistory) {
      stats.miningHistory.forEach(card => {
        if (card.bookTitle === currentTitle) {
          set.add(card.sentence);
        }
      });
    }
    return set;
  }, [stats.miningHistory, metadata?.title]);

  return (
    <ReaderView
      sentences={sentences}
      activeIndex={activeIndex}
      onIndexChange={setActiveIndex}
      tapToSelect={tapToSelect}
      showArrows={showArrows}
      assignRef={assignRef}
      onOpenJump={onOpenJump}
      minedSentences={minedSentencesSet}
      centerActive={centerActive}
    />
  );
});
