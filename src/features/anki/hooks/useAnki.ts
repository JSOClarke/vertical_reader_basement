import { useState, useCallback } from 'react';
import { updateLastCard } from '../utils/ankiConnect';
import { useProfileStore } from '../../profile/store/useProfileStore';
import { useBookStore } from '../../reader/store/useBookStore';

/**
 * Custom hook to handle Anki mining logic.
 * It manages the API connection and global store state for stats and sync.
 */
export const useAnki = (showToast: (msg: string, type: 'success' | 'error') => void, t: any) => {
  const [isAnkiLoading, setIsAnkiLoading] = useState(false);
  
  const ankiField = useProfileStore(state => state.ankiField);
  const setStats = useProfileStore(state => state.setStats);
  const setHasUnsavedChanges = useProfileStore(state => state.setHasUnsavedChanges);
  const metadata = useBookStore(state => state.metadata);

  const mineSentence = useCallback(async (sentence: string) => {
    if (!ankiField || !ankiField.trim()) {
      showToast(t.setAnkiFieldToast, 'error');
      return;
    }
    
    setIsAnkiLoading(true);
    try {
      await updateLastCard(metadata, ankiField);
      
      // Update Mining History and mark as unsaved
      setStats((prev) => ({
        ...prev,
        miningHistory: [
          { 
            bookTitle: metadata?.title || t.unknownBook, 
            sentence, 
            timestamp: Date.now() 
          }, 
          ...(prev.miningHistory || [])
        ].slice(0, 100),
      }));
      
      setHasUnsavedChanges(true);
      showToast(t.ankiSuccessToast || 'Card updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || t.ankiFailToast, 'error');
    } finally {
      setIsAnkiLoading(false);
    }
  }, [ankiField, metadata, setStats, setHasUnsavedChanges, showToast, t]);

  return {
    mineSentence,
    isAnkiLoading,
    ankiField
  };
};
