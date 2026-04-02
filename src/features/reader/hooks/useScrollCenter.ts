import { useEffect, useRef } from 'react';

export const useScrollCenter = (activeIndex: number, totalSentences: number, centerActive: boolean = true) => {
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevCenterActive = useRef(centerActive);

  // Automatically adjust the array size if totally sentences changes
  useEffect(() => {
    sentenceRefs.current = sentenceRefs.current.slice(0, totalSentences);
  }, [totalSentences]);

  // Handle the DOM scrolling whenever activeIndex changes
  useEffect(() => {
    const activeElement = sentenceRefs.current[activeIndex];
    if (!activeElement) return;

    const wasToggledOff = prevCenterActive.current === true && centerActive === false;
    prevCenterActive.current = centerActive;

    if (centerActive) {
      // CENTERED MODE: Auto-scrolling to center the active element
      activeElement.scrollIntoView({
        inline: 'center', // Horizontal centering for vertical writing mode (block axis)
        block: 'center'   // Vertical centering (inline axis)
      });
    } else {
      // PAGINATED MODE: Stay static until edge is reached
      const container = activeElement.closest(`[class*="readerContainer"]`);
      if (!container) return;

      const rect = activeElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const buffer = 80; // Trigger "flip" before the actual edge for better comfort

      // In vertical-rl: 
      // Advancing to the left (next sentence): if rect.left is beyond container's left edge
      // OR if we just toggled from centered to paginated mode (force a snap to the right edge)
      if (wasToggledOff || rect.left < containerRect.left + buffer) {
        activeElement.scrollIntoView({ inline: 'start' }); // Snap to right edge (start)
      } 
      // Going back to the right (previous sentence): if rect.right is beyond container's right edge
      else if (rect.right > containerRect.right - buffer) {
        activeElement.scrollIntoView({ inline: 'end' }); // Snap to left edge (end)
      }
    }
  }, [activeIndex, totalSentences, centerActive]);

  // Provide a clean callback to assign DOM nodes to our ref array
  const assignRef = (idx: number) => (el: HTMLDivElement | null) => {
    if (el) {
      sentenceRefs.current[idx] = el;
    }
  };

  return { assignRef };
};
