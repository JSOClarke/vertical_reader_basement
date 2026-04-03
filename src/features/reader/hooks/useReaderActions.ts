import { useCallback } from 'react';
import { useReaderStore } from '../store/useReaderStore';

/**
 * Hook for core reader UI actions like translation and copying.
 * It coordinates with the useReaderStore for state management.
 */
export const useReaderActions = () => {
  const setTranslation = useReaderStore((state) => state.setTranslation);
  const setIsTranslating = useReaderStore((state) => state.setIsTranslating);
  
  const translate = useCallback(async (sentence: string) => {
    if (!sentence || !sentence.trim()) return;
    
    setIsTranslating(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q=${encodeURIComponent(sentence)}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data[0]) {
        const translatedText = data[0].map((item: any) => item[0]).join('');
        setTranslation(translatedText);
      } else {
        setTranslation('Translation failed.');
      }
    } catch (err) {
      console.error(err);
      setTranslation('Network error during translation.');
    } finally {
      setIsTranslating(false);
    }
  }, [setTranslation, setIsTranslating]);

  const copy = useCallback(async (sentence: string, showToast: (m: string) => void, t: any) => {
    if (!sentence || !sentence.trim()) return;
    try {
      await navigator.clipboard.writeText(sentence);
      showToast(t.copiedToast);
    } catch (err) {
      showToast(t.copyFailToast);
    }
  }, []);

  return {
    translate,
    copy,
  };
};
