import { useEffect, useRef } from 'react';

export const useScrollCenter = (
  activeIndex: number, 
  totalSentences: number, 
  centerActive: boolean = true,
  orientation: 'vertical' | 'horizontal' = 'vertical'
) => {
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
        inline: 'center', 
        block: 'center',
        behavior: 'smooth'
      });
    } else {
      // PAGINATED MODE: Stay static until edge is reached
      const container = activeElement.closest(`[class*="readerContainer"]`);
      if (!container) return;

      const rect = activeElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const buffer = 80;

      if (orientation === 'vertical') {
        // Vertical-RL: Horizontal scrolling (Right to Left)
        if (wasToggledOff || rect.left < containerRect.left + buffer) {
          // Moving forward (Left): snap current sentence to the RIGHT (start)
          activeElement.scrollIntoView({ inline: 'start', behavior: 'smooth' }); 
        } 
        else if (rect.right > containerRect.right - buffer) {
          // Moving backward (Right): snap current sentence to the LEFT (end)
          activeElement.scrollIntoView({ inline: 'end', behavior: 'smooth' });
        }
      } else {
        // Horizontal-TB: Vertical scrolling (Top to Bottom)
        // If we just toggled centering OFF, snap to the Top (Start)
        if (wasToggledOff || rect.bottom > containerRect.bottom - buffer) {
          // Moving forward (Down): snap current sentence to the TOP (start)
          activeElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
        else if (rect.top < containerRect.top + buffer) {
          // Moving backward (Up): snap current sentence to the BOTTOM (end)
          activeElement.scrollIntoView({ block: 'end', behavior: 'smooth' });
        }
      }
    }
  }, [activeIndex, totalSentences, centerActive, orientation]);

  // Provide a clean callback to assign DOM nodes to our ref array
  const assignRef = (idx: number) => (el: HTMLDivElement | null) => {
    if (el) {
      sentenceRefs.current[idx] = el;
    }
  };

  return { assignRef };
};
