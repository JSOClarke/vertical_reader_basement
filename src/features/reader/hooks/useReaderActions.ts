import { useState, useCallback } from 'react';
import { updateLastCard } from '../../anki/utils/ankiConnect';
import type { BookMetadata } from '../../../types';

export interface ReaderActions {
  translation: string | null;
  loading: boolean;
  ankiLoading: boolean;
  toast: { message: string; type: 'success' | 'error' } | null;
  translate: (sentence: string) => Promise<void>;
  copy: (sentence: string, t: any) => Promise<void>;
  mineAnki: (sentence: string, metadata: BookMetadata | undefined, ankiField: string, onAnkiMine: (s: string) => void, t: any) => Promise<void>;
  toggleBookmark: () => void;
  clearTranslation: () => void;
}

export const useReaderActions = (onToggleBookmark: () => void): ReaderActions => {
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ankiLoading, setAnkiLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const translate = useCallback(async (sentence: string) => {
    if (!sentence || !sentence.trim()) return;
    setLoading(true);
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
      setLoading(false);
    }
  }, []);

  const copy = useCallback(async (sentence: string, t: any) => {
    if (!sentence || !sentence.trim()) return;
    try {
      await navigator.clipboard.writeText(sentence);
      showToast(t.copiedToast, 'success');
    } catch (err) {
      showToast(t.copyFailToast, 'error');
    }
  }, [showToast]);

  const mineAnki = useCallback(async (
    sentence: string, 
    metadata: BookMetadata | undefined, 
    ankiField: string, 
    onAnkiMine: (s: string) => void, 
    t: any
  ) => {
    if (!ankiField || !ankiField.trim()) {
      showToast(t.setAnkiFieldToast, 'error');
      return;
    }
    setAnkiLoading(true);
    try {
      await updateLastCard(metadata, ankiField);
      showToast(t.ankiSuccessToast, 'success');
      onAnkiMine(sentence);
    } catch (err: any) {
      showToast(t.ankiFailToast, 'error');
    } finally {
      setAnkiLoading(false);
    }
  }, [showToast]);

  const clearTranslation = useCallback(() => setTranslation(null), []);

  return {
    translation,
    loading,
    ankiLoading,
    toast,
    translate,
    copy,
    mineAnki,
    toggleBookmark: onToggleBookmark,
    clearTranslation
  };
};
