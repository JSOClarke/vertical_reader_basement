import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { UserStats, ReaderAesthetics, UserProfile, Language } from '../../../types';

interface ProfileState extends Omit<UserProfile, 'sentences' | 'metadata'> {
  activeIndex: number;
  ankiField: string;
  stats: UserStats;
  bookmarks: number[];
  aesthetics: ReaderAesthetics;
  theme: 'dark' | 'light';
  language: Language;
  tapToSelect: boolean;
  showArrows: boolean;
  centerActive: boolean;
  hasUnsavedChanges: boolean;

  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  setAesthetics: (aesthetics: Partial<ReaderAesthetics>) => void;
  
  // Navigation & Progress
  setActiveIndex: (index: number | ((prev: number) => number)) => void;
  
  // Toggles
  toggleTapToSelect: () => void;
  toggleArrows: () => void;
  toggleCenterActive: () => void;
  toggleBookmark: (index: number) => void;
  setBookmarks: (bookmarks: number[]) => void;
  
  // Anki & Stats
  setAnkiField: (field: string) => void;
  setStats: (stats: UserStats | ((prev: UserStats) => UserStats)) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  
  // Batch updates (e.g. from Cloud Pull)
  importProfile: (profile: Partial<UserProfile>) => void;
}

export const useProfileStore = create<ProfileState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        // Initial State (Progress & Settings Only)
        activeIndex: 0,
        ankiField: '',
        bookmarks: [],
        stats: {
          totalCharactersRead: 0,
          readingDays: [],
          miningHistory: [],
        },
        aesthetics: {
          fontSize: 28,
          verticalMargin: 10,
          horizontalMargin: 40,
          readingWidth: 100,
        },
        theme: (localStorage.getItem('theme') as 'dark' | 'light') || 'dark',
        language: (localStorage.getItem('language') as Language) || 'en',
        tapToSelect: true,
        showArrows: true,
        centerActive: true,
        hasUnsavedChanges: false,

        // Actions
        setTheme: (theme) => set({ theme }),
        toggleTheme: () => set((state) => ({ 
          theme: state.theme === 'dark' ? 'light' : 'dark',
          hasUnsavedChanges: true 
        })),
        setLanguage: (language) => set({ language }),
        toggleLanguage: () => set((state) => ({ 
          language: state.language === 'en' ? 'ja' : 'en',
          hasUnsavedChanges: true 
        })),
        setAesthetics: (aesthetics) => set((state) => ({ 
          aesthetics: { ...state.aesthetics, ...aesthetics } 
        })),

        setActiveIndex: (index) => set((state) => ({ 
          activeIndex: typeof index === 'function' ? index(state.activeIndex) : index 
        })),

        toggleTapToSelect: () => set((state) => ({ tapToSelect: !state.tapToSelect })),
        toggleArrows: () => set((state) => ({ showArrows: !state.showArrows })),
        toggleCenterActive: () => set((state) => ({ centerActive: !state.centerActive })),
        
        toggleBookmark: (index) => set((state) => {
          const bookmarks = state.bookmarks.includes(index)
            ? state.bookmarks.filter(i => i !== index)
            : [...state.bookmarks, index].sort((a, b) => a - b);
          return { bookmarks };
        }),
        setBookmarks: (bookmarks) => set({ bookmarks }),

        setAnkiField: (ankiField) => set({ ankiField }),
        setStats: (stats) => set((state) => ({ 
          stats: typeof stats === 'function' ? stats(state.stats) : stats 
        })),
        setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),


        importProfile: (profile) => set((state) => ({
          activeIndex: profile.activeIndex ?? state.activeIndex,
          ankiField: profile.ankiField ?? state.ankiField,
          stats: profile.stats ?? state.stats,
          bookmarks: profile.bookmarks ?? state.bookmarks,
          aesthetics: { ...state.aesthetics, ...profile.aesthetics },
          theme: profile.theme ?? state.theme,
          language: (profile.language as Language) ?? state.language,
          tapToSelect: profile.tapToSelect ?? state.tapToSelect,
          showArrows: profile.showArrows ?? state.showArrows,
          centerActive: profile.centerActive ?? state.centerActive,
        })),
      }),
      {
        name: 'tateyomi-profile', // Use existing localStorage key
        partialize: (state) => ({
          activeIndex: state.activeIndex,
          ankiField: state.ankiField,
          stats: state.stats,
          bookmarks: state.bookmarks,
          aesthetics: state.aesthetics,
          theme: state.theme,
          language: state.language,
          tapToSelect: state.tapToSelect,
          showArrows: state.showArrows,
          centerActive: state.centerActive,
        }),
      }
    )
  )
);
