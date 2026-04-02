import { useEffect, useRef } from 'react';

export const useScrollCenter = (activeIndex: number, totalSentences: number) => {
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Automatically adjust the array size if totally sentences changes
  useEffect(() => {
    sentenceRefs.current = sentenceRefs.current.slice(0, totalSentences);
  }, [totalSentences]);

  // Handle the DOM scrolling whenever activeIndex changes
  useEffect(() => {
    const activeElement = sentenceRefs.current[activeIndex];
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'center', // Horizontal centering for vertical writing mode
        block: 'center'   // Vertical centering
      });
    }
  }, [activeIndex, totalSentences]);

  // Provide a clean callback to assign DOM nodes to our ref array
  const assignRef = (idx: number) => (el: HTMLDivElement | null) => {
    if (el) {
      sentenceRefs.current[idx] = el;
    }
  };

  return { assignRef };
};
