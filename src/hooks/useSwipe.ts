import { useRef, useCallback } from 'react';

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

/**
 * Detects horizontal swipe gestures.
 * For vertical-rl reading: swipe left = next, swipe right = prev.
 */
export function useSwipe(
  onSwipePrev: () => void,
  onSwipeNext: () => void,
  axis: 'x' | 'y' = 'x',
  threshold = 50
): SwipeHandlers {
  const startX = useRef(0);
  const startY = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diff = axis === 'x' ? endX - startX.current : endY - startY.current;
    const crossDiff = axis === 'x' ? endY - startY.current : endX - startX.current;

    if (Math.abs(diff) < threshold || Math.abs(diff) < Math.abs(crossDiff)) return;

    if (diff < 0) {
      onSwipeNext();
    } else {
      onSwipePrev();
    }
  }, [onSwipePrev, onSwipeNext, axis, threshold]);

  return { onTouchStart, onTouchEnd };
}
