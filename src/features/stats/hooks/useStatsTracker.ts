import { useEffect, useRef } from 'react';
import { useProfileStore } from '../../profile/store/useProfileStore';
import { useBookStore } from '../../reader/store/useBookStore';

/**
 * Custom hook to track reading statistics (characters read and reading days)
 * in the background. It monitors changes to the active sentence index.
 */
export const useStatsTracker = (clearTranslation: () => void) => {
  const activeIndex = useProfileStore((state) => state.activeIndex);
  const setStats = useProfileStore((state) => state.setStats);
  const bookData = useBookStore((state) => state.sentences);
  
  const prevIndexRef = useRef<number>(activeIndex);

  useEffect(() => {
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Check if we advanced forward
    if (bookData.length > 0 && activeIndex > prevIndexRef.current) {
      const addedChars = bookData
        .slice(prevIndexRef.current, activeIndex)
        .reduce((sum, s) => sum + s.length, 0);
        
      setStats((prev) => ({
        ...prev,
        totalCharactersRead: prev.totalCharactersRead + addedChars,
        readingDays: prev.readingDays.includes(dateStr) 
          ? prev.readingDays 
          : [...prev.readingDays, dateStr]
      }));
    } else {
      // Still update reading days if it's a new day even if not moving forward
      setStats((prev) => {
        if (!prev.readingDays.includes(dateStr)) {
          return { ...prev, readingDays: [...prev.readingDays, dateStr] };
        }
        return prev;
      });
    }
    
    prevIndexRef.current = activeIndex;
    clearTranslation();
  }, [activeIndex, bookData, setStats, clearTranslation]);
};
