import { useEffect, useRef } from 'react';

export const useReaderState = (
  totalSentences: number,
  setActiveIndex: (action: number | ((prev: number) => number)) => void
) => {
  const wheelAccumulator = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // In logical vertical reading flow: Next is Left, Prev is Right
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => Math.min(prev + 1, totalSentences - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Accumulate wheel delta to handle smooth trackpads vs discrete mouse wheels gracefully
      wheelAccumulator.current += e.deltaY;

      const THRESHOLD = 80;

      if (wheelAccumulator.current >= THRESHOLD) {
        setActiveIndex((prev) => Math.min(prev + 1, totalSentences - 1));
        wheelAccumulator.current = 0;
      } else if (wheelAccumulator.current <= -THRESHOLD) {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        wheelAccumulator.current = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [totalSentences, setActiveIndex]);
};
