import { create } from 'zustand';

interface ReaderUIState {
  translation: string | null;
  isTranslating: boolean;
  toast: { message: string; type: 'success' | 'error' } | null;
  
  // Actions
  setTranslation: (text: string | null) => void;
  setIsTranslating: (loading: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  clearTranslation: () => void;
}

/**
 * Store for transient reader UI state (not persisted to disk).
 * Handles translation results and loading states.
 */
export const useReaderStore = create<ReaderUIState>((set) => ({
  translation: null,
  isTranslating: false,
  toast: null,

  setTranslation: (translation) => set({ translation }),
  setIsTranslating: (isTranslating) => set({ isTranslating }),
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
  clearTranslation: () => set({ translation: null, isTranslating: false, toast: null }),
}));
