import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SAMPLE_DATA } from '../../../data/mockBook';
import type { BookMetadata } from '../../../types';

interface BookState {
  sentences: string[];
  metadata?: BookMetadata;
  
  // Actions
  setBookData: (sentences: string[]) => void;
  setMetadata: (metadata: BookMetadata | undefined) => void;
  resetBook: () => void;
}

export const useBookStore = create<BookState>()(
  persist(
    (set) => ({
      // Initial State
      sentences: SAMPLE_DATA,
      metadata: undefined,

      // Actions
      setBookData: (sentences) => set({ sentences }),
      setMetadata: (metadata) => set({ metadata }),
      resetBook: () => set({ sentences: [], metadata: undefined }),
    }),
    {
      name: 'tateyomi-book-data', // Dedicated disk key for the large book
    }
  )
);
