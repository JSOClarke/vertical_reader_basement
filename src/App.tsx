import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useGoogleDrive } from './hooks/useGoogleDrive';
import { ReaderContainer } from './features/reader/components/ReaderContainer';
import { BottomHUD } from './features/reader/components/BottomHUD';
import { AnkiSettingsModal } from './features/anki/components/AnkiSettingsModal';
import { JumpToModal } from './features/reader/components/JumpToModal';
import { StatsView } from './features/stats/components/StatsView';
import { NotesSidebar } from './features/profile/components/NotesSidebar';
import { LibrarySidebar } from './features/library/components/LibrarySidebar';
import { useReaderActions } from './features/reader/hooks/useReaderActions';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { SAMPLE_DATA } from './data/mockBook';
import { translations } from './localization/translations';
import type { Language } from './localization/translations';
import type { BookMetadata, UserStats, ReaderAesthetics, UserLibrary, BookEntry, AestheticsPreset } from './types';
import './App.css'; 

const menuItemStyle: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--btn-text)',
  padding: '14px 24px',
  border: 'none',
  borderBottom: '1px solid rgba(128,128,128,0.08)',
  fontSize: '13px',
  fontFamily: "'Inter', 'system-ui', sans-serif",
  fontWeight: '500',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  gap: '12px',
  boxSizing: 'border-box',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const hudButtonStyle: React.CSSProperties = {
  background: 'var(--btn-bg)',
  color: 'var(--btn-text)',
  padding: '10px 16px',
  border: 'none',
  fontSize: '12px',
  fontFamily: "'Inter', 'system-ui', sans-serif",
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  boxShadow: 'var(--btn-shadow)',
  transition: 'opacity 0.2s',
  borderRadius: '0'
};

const MenuIcon = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ) : (
      <>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </>
    )}
  </svg>
);

const StatusDot = ({ active }: { active: boolean }) => (
  <div style={{
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: active ? '#f59e0b' : 'rgba(128,128,128,0.3)',
    marginLeft: 'auto',
    transition: 'background 0.3s ease',
    boxShadow: active ? '0 0 8px rgba(245,158,11,0.4)' : 'none'
  }} />
);

const MenuCategory = ({ label }: { label: string }) => (
  <div style={{
    padding: '12px 20px 6px',
    fontSize: '10px',
    fontFamily: "'Inter', 'system-ui', sans-serif",
    fontWeight: '700',
    letterSpacing: '0.1em',
    color: 'rgba(128,128,128,0.6)',
    textTransform: 'uppercase',
    borderTop: '1px solid rgba(128,128,128,0.1)',
    marginTop: '4px'
  }}>
    {label}
  </div>
);

const ValueStepper = ({ label, value, unit = '', onDecrease, onIncrease }: { 
  label: string, 
  value: number, 
  unit?: string,
  onDecrease: () => void, 
  onIncrease: () => void 
}) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '10px 20px',
    fontSize: '13px',
    fontFamily: "'Inter', 'system-ui', sans-serif",
    color: 'var(--btn-text)',
    boxSizing: 'border-box',
    width: '100%'
  }}>
    <span style={{ opacity: 0.8 }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <button onClick={onDecrease} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px', padding: '5px' }}>−</button>
      <span style={{ minWidth: '35px', textAlign: 'center', fontWeight: 'bold' }}>{value}{unit}</span>
      <button onClick={onIncrease} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px', padding: '5px' }}>+</button>
    </div>
  </div>
);

const LEGACY_STORAGE_KEY = 'vertical-reader-profile';
const PROFILE_STORAGE_KEY = 'tateyomi-profile';

const generateBookId = (metadata?: BookMetadata, sentenceCount: number = 0) => {
  const title = metadata?.title || 'Unknown';
  const author = metadata?.author || 'Unknown';
  return `${title}-${author}-${sentenceCount}`.replace(/\s+/g, '-').toLowerCase();
};

function loadSavedLibrary(): UserLibrary {
  const defaultLibrary: UserLibrary = {
    books: [],
    settings: {
      ankiField: '',
      stats: { totalCharactersRead: 0, readingDays: [], miningHistory: [] },
      aesthetics: { fontSize: 28, verticalMargin: 10, horizontalMargin: 40, readingWidth: 100 },
      language: (localStorage.getItem('language') as any) || 'en',
      theme: (localStorage.getItem('theme') as any) || 'dark',
      tapToSelect: localStorage.getItem('tapToSelect') !== 'false',
      showArrows: localStorage.getItem('showArrows') !== 'false',
      centerActive: localStorage.getItem('centerActive') !== 'false',
      readerOrientation: (localStorage.getItem('readerOrientation') as any) || 'vertical',
      aestheticsPresets: [],
    }
  };

  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return defaultLibrary;

    const parsed = JSON.parse(raw);

    // Migration logic
    if (Array.isArray(parsed.sentences) && typeof parsed.activeIndex === 'number') {
      const legacyBook: BookEntry = {
        id: generateBookId(parsed.metadata, parsed.sentences.length),
        sentences: parsed.sentences,
        metadata: parsed.metadata || {},
        progress: {
          activeIndex: parsed.activeIndex,
          bookmarks: parsed.bookmarks || [],
          notes: parsed.notes || '',
          lastRead: Date.now(),
        }
      };

      return {
        books: [legacyBook],
        activeBookId: legacyBook.id,
        settings: {
          ankiField: parsed.ankiField || '',
          stats: parsed.stats || defaultLibrary.settings.stats,
          aesthetics: parsed.aesthetics || defaultLibrary.settings.aesthetics,
          language: defaultLibrary.settings.language,
          theme: defaultLibrary.settings.theme,
          tapToSelect: defaultLibrary.settings.tapToSelect,
          showArrows: defaultLibrary.settings.showArrows,
          centerActive: defaultLibrary.settings.centerActive,
          readerOrientation: defaultLibrary.settings.readerOrientation,
          aestheticsPresets: parsed.aestheticsPresets || [],
        }
      };
    }

    if (parsed.books && Array.isArray(parsed.books)) {
      return parsed as UserLibrary;
    }
  } catch (e) {
    console.error("Failed to load library:", e);
  }
  return defaultLibrary;
}

function App() {
  const [library, setLibrary] = useState<UserLibrary>(() => loadSavedLibrary());
  const { isConnected, isPushing, isPulling, lastSynced, connect, push, pull } = useGoogleDrive();

  const activeBook = useMemo(() => {
    return library.books.find(b => b.id === library.activeBookId) || null;
  }, [library.books, library.activeBookId]);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [activeIndex, setActiveIndex] = useState<number>(activeBook?.progress.activeIndex ?? 0);
  const [bookData, setBookData] = useState<string[]>(activeBook?.sentences ?? SAMPLE_DATA);
  const [metadata, setMetadata] = useState<BookMetadata>(activeBook?.metadata ?? {});
  const [bookmarks, setBookmarks] = useState<number[]>(activeBook?.progress.bookmarks ?? []);
  const [notes, setNotes] = useState<string>(activeBook?.progress.notes ?? '');

  const [stats, setStats] = useState<UserStats>(library.settings.stats);
  const [ankiField, setAnkiField] = useState(library.settings.ankiField);
  const [aesthetics, setAesthetics] = useState<ReaderAesthetics>(library.settings.aesthetics);
  const [language, setLanguage] = useState<Language>(library.settings.language);
  const [theme, setTheme] = useState<'dark' | 'light'>(library.settings.theme);
  const [tapToSelect, setTapToSelect] = useState<boolean>(library.settings.tapToSelect);
  const [showArrows, setShowArrows] = useState<boolean>(library.settings.showArrows);
  const [centerActive, setCenterActive] = useState<boolean>(library.settings.centerActive);
  const [readerOrientation, setReaderOrientation] = useState<'vertical' | 'horizontal'>(library.settings.readerOrientation);
  const [aestheticsPresets, setAestheticsPresets] = useState<AestheticsPreset[]>(library.settings.aestheticsPresets || []);

  const [error, setError] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'reader' | 'stats'>('reader');
  const [ankiModalOpen, setAnkiModalOpen] = useState(false);
  const [isJumpModalOpen, setJumpModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const prevIndexRef = useRef<number>(activeIndex);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const readerActions = useReaderActions(() => handleToggleBookmark());

  useEffect(() => {
    if (activeBook) {
      setActiveIndex(activeBook.progress.activeIndex);
      setBookData(activeBook.sentences);
      setMetadata(activeBook.metadata);
      setBookmarks(activeBook.progress.bookmarks);
      setNotes(activeBook.progress.notes);
    } else if (library.books.length === 0) {
      setBookData(SAMPLE_DATA);
      setActiveIndex(0);
      setMetadata({});
      setBookmarks([]);
      setNotes('');
    }
  }, [library.activeBookId]);

  useEffect(() => {
    if (!library.activeBookId) return;
    
    setLibrary((prev: UserLibrary) => {
      const idx = prev.books.findIndex(b => b.id === prev.activeBookId);
      if (idx === -1) return prev;
      
      const updatedBooks = [...prev.books];
      updatedBooks[idx] = {
        ...updatedBooks[idx],
        sentences: bookData,
        metadata,
        progress: {
          ...updatedBooks[idx].progress,
          activeIndex,
          bookmarks,
          notes,
          lastRead: Date.now()
        }
      };
      
      return { ...prev, books: updatedBooks };
    });
  }, [activeIndex, bookmarks, notes, bookData, metadata]);

  useEffect(() => {
    setLibrary((prev: UserLibrary) => ({
      ...prev,
      settings: {
        ankiField,
        stats,
        aesthetics,
        language,
        theme,
        tapToSelect,
        showArrows,
        centerActive,
        readerOrientation,
        aestheticsPresets
      }
    }));
  }, [ankiField, stats, aesthetics, language, theme, tapToSelect, showArrows, centerActive, readerOrientation, aestheticsPresets]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const minedSentencesSet = useMemo(() => {
    const currentTitle = metadata?.title || 'Unknown Book';
    const set = new Set<string>();
    if (stats.miningHistory) {
      stats.miningHistory.forEach(card => {
        if (card.bookTitle === currentTitle) {
          set.add(card.sentence);
        }
      });
    }
    return set;
  }, [stats.miningHistory, metadata?.title]);

  const toggleLanguage = () => setLanguage(prev => {
    const next = prev === 'en' ? 'ja' : 'en';
    localStorage.setItem('language', next);
    return next;
  });

  const t = translations[language];

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(library));
        if (isConnected) setHasUnsavedChanges(true);
      } catch {
        // storage error
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [library, isConnected]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && isConnected) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isConnected]);

  useEffect(() => {
    const dateStr = new Date().toISOString().split('T')[0];
    if (activeIndex > prevIndexRef.current) {
      const addedChars = bookData
        .slice(prevIndexRef.current, activeIndex)
        .reduce((sum, s) => sum + s.length, 0);
        
      setStats(prev => {
        const newDays = prev.readingDays.includes(dateStr) 
          ? prev.readingDays 
          : [...prev.readingDays, dateStr];
          
        return {
          ...prev,
          totalCharactersRead: prev.totalCharactersRead + addedChars,
          readingDays: newDays
        };
      });
    } else {
      setStats(prev => {
        if (!prev.readingDays.includes(dateStr)) {
          return { ...prev, readingDays: [...prev.readingDays, dateStr] };
        }
        return prev;
      });
    }
    
    prevIndexRef.current = activeIndex;
    readerActions.clearTranslation();
  }, [activeIndex, bookData, readerActions.clearTranslation]);

  const toggleTapToSelect = () => setTapToSelect(prev => {
    const next = !prev;
    localStorage.setItem('tapToSelect', String(next));
    return next;
  });

  const toggleArrows = () => setShowArrows(prev => {
    const next = !prev;
    localStorage.setItem('showArrows', String(next));
    return next;
  });

  const toggleCenterActive = () => setCenterActive(prev => {
    const next = !prev;
    localStorage.setItem('centerActive', String(next));
    return next;
  });
  
  const toggleOrientation = () => setReaderOrientation(prev => {
    const next = prev === 'vertical' ? 'horizontal' : 'vertical';
    localStorage.setItem('readerOrientation', next);
    return next;
  });

  const saveCurrentAsPreset = () => {
    const name = window.prompt(t.presetNamePlaceholder || "Preset Name");
    if (!name) return;
    
    const newPreset: AestheticsPreset = {
      id: Date.now().toString(),
      name,
      aesthetics: { ...aesthetics }
    };
    
    setAestheticsPresets(prev => [...prev, newPreset]);
    showToast(t.cloudPushSuccess || "Saved!");
  };

  const applyPreset = (preset: AestheticsPreset) => {
    setAesthetics(preset.aesthetics);
    showToast(`${preset.name} applied`);
  };

  const deletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(t.confirmDeletePreset || "Delete?")) return;
    setAestheticsPresets(prev => prev.filter(p => p.id !== id));
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleAnkiMine = (sentence: string) => {
    setStats(prev => ({
      ...prev,
      miningHistory: [
        {
          bookTitle: metadata?.title || t.unknownBook,
          sentence,
          timestamp: Date.now(),
        },
        ...(prev.miningHistory || []),
      ].slice(0, 100),
    }));
    setHasUnsavedChanges(true);
  };

  const handleToggleBookmark = () => {
    setBookmarks(prev => {
      if (prev.includes(activeIndex)) {
        return prev.filter(i => i !== activeIndex);
      }
      return [...prev, activeIndex].sort((a, b) => a - b);
    });
    setHasUnsavedChanges(true);
  };

  const handleCloudPush = async () => {
    const success = await push(library);
    if (success) {
      showToast(t.cloudPushSuccess || "Sync Successful!", 'success');
      setHasUnsavedChanges(false);
    } else {
      showToast(t.cloudSyncError, 'error');
    }
  };

  const handleCloudPull = async () => {
    const cloudLibrary = await pull() as any;
    if (cloudLibrary) {
      if (confirm(t.confirmReset)) {
        setLibrary(cloudLibrary);
        showToast(t.cloudPullSuccess, 'success');
      }
    } else {
      showToast(t.cloudSyncError, 'error');
    }
  };

  useKeyboardShortcuts({
    'T': () => readerActions.translate(bookData[activeIndex]),
    'C': () => readerActions.copy(bookData[activeIndex], t),
    'A': () => readerActions.mineAnki(bookData[activeIndex], metadata, ankiField, handleAnkiMine, t),
    'B': () => handleToggleBookmark(),
  });

  const handleActiveIndexChange = (index: number) => {
    setActiveIndex(index);
    if (isConnected) setHasUnsavedChanges(true);
  };

  const handleJumpToIndex = (index: number) => {
    handleActiveIndexChange(index);
    setJumpModalOpen(false);
  };

  const handleDeleteBook = (id: string) => {
    if (!window.confirm(t.confirmDeleteBook)) return;
    
    setLibrary((prev: UserLibrary) => {
      const newBooks = prev.books.filter(b => b.id !== id);
      let newActiveId = prev.activeBookId;
      if (newActiveId === id) {
        newActiveId = newBooks.length > 0 ? newBooks[0].id : undefined;
      }
      return { ...prev, books: newBooks, activeBookId: newActiveId };
    });
  };

  const renderMenuContent = () => (
    <>
      <MenuCategory label={t.displaySettings || "Display"} />
      <button onClick={() => toggleTheme()} style={menuItemStyle}>
        {theme === 'dark' ? t.lightMode : t.darkMode}
      </button>
      <button onClick={() => toggleLanguage()} style={menuItemStyle}>
        {language === 'en' ? 'Language: EN' : '言語: 日本語'}
      </button>

      <MenuCategory label={t.aestheticsSettings || "Aesthetics"} />
      <ValueStepper 
        label={t.fontSizeLabel || "Font Size"} 
        value={aesthetics.fontSize} 
        unit="px"
        onDecrease={() => setAesthetics(prev => ({ ...prev, fontSize: Math.max(12, prev.fontSize - 2) }))}
        onIncrease={() => setAesthetics(prev => ({ ...prev, fontSize: Math.min(48, prev.fontSize + 2) }))}
      />
      <ValueStepper 
        label={t.verticalMarginLabel || "Top/Bottom"} 
        value={aesthetics.verticalMargin} 
        unit="vh"
        onDecrease={() => setAesthetics(prev => ({ ...prev, verticalMargin: Math.max(0, prev.verticalMargin - 1) }))}
        onIncrease={() => setAesthetics(prev => ({ ...prev, verticalMargin: Math.min(30, prev.verticalMargin + 1) }))}
      />
      <ValueStepper 
        label={t.horizontalMarginLabel || "Left/Right"} 
        value={aesthetics.horizontalMargin} 
        unit="px"
        onDecrease={() => setAesthetics(prev => ({ ...prev, horizontalMargin: Math.max(0, prev.horizontalMargin - 5) }))}
        onIncrease={() => setAesthetics(prev => ({ ...prev, horizontalMargin: Math.min(100, prev.horizontalMargin + 5) }))}
      />
      <ValueStepper 
        label={t.readingWidthLabel || "Viewing Width"} 
        value={aesthetics.readingWidth} 
        unit="%"
        onDecrease={() => setAesthetics(prev => ({ ...prev, readingWidth: Math.max(30, prev.readingWidth - 5) }))}
        onIncrease={() => setAesthetics(prev => ({ ...prev, readingWidth: Math.min(100, prev.readingWidth + 5) }))}
      />
      
      <MenuCategory label={t.presetsTitle || "Presets"} />
      <button onClick={saveCurrentAsPreset} style={{ ...menuItemStyle, color: 'var(--accent-color)', justifyContent: 'center', fontWeight: 'bold' }}>
        + {t.savePreset || "Save Current"}
      </button>
      
      {aestheticsPresets.map(preset => (
        <div key={preset.id} style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => applyPreset(preset)} style={{ ...menuItemStyle, borderBottom: 'none' }}>
            {preset.name}
          </button>
          <button 
            onClick={(e) => deletePreset(preset.id, e)} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#ff4b4b', 
              padding: '10px 20px', 
              cursor: 'pointer',
              fontSize: '10px',
              opacity: 0.5
            }}
          >
            {t.deleteKey || "Delete"}
          </button>
        </div>
      ))}
      
      <MenuCategory label={t.readingSettings || "Reading"} />
      <button onClick={() => toggleTapToSelect()} style={menuItemStyle}>
        {t.tapSelect}
        <StatusDot active={tapToSelect} />
      </button>
      <button onClick={() => toggleArrows()} style={menuItemStyle}>
        {t.showArrows}
        <StatusDot active={showArrows} />
      </button>
      <button onClick={() => toggleCenterActive()} style={menuItemStyle}>
        {t.centerActive}
        <StatusDot active={centerActive} />
      </button>
      <button onClick={() => toggleOrientation()} style={menuItemStyle}>
        {readerOrientation === 'vertical' ? 'Mode: Vertical' : 'Mode: Horizontal'}
      </button>

      <MenuCategory label={t.dataActions || "Actions"} />
      <button onClick={() => { setCurrentView('stats'); setMobileMenuOpen(false); }} style={menuItemStyle}>
        {t.viewStats}
      </button>

      <label style={{ ...menuItemStyle, cursor: 'pointer' }}>
        {t.loadEpub}
        <input type="file" accept=".epub" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const { parseEpub } = await import('./features/epub/utils/epubParser');
            const data = await parseEpub(file);
            if (data.sentences.length === 0) {
              setError(t.noTextInEpub);
            } else {
              const bookId = generateBookId(data.metadata, data.sentences.length);
              setLibrary((prev: UserLibrary) => {
                if (prev.books.some(b => b.id === bookId)) {
                  return { ...prev, activeBookId: bookId };
                }
                const newBook: BookEntry = {
                  id: bookId,
                  sentences: data.sentences,
                  metadata: data.metadata,
                  progress: {
                    activeIndex: 0,
                    bookmarks: [],
                    notes: '',
                    lastRead: Date.now()
                  }
                };
                return {
                  ...prev,
                  books: [newBook, ...prev.books],
                  activeBookId: bookId
                };
              });
              setError(null);
            }
          } catch (err: any) {
            setError(t.failedParseEpub);
          }
          e.target.value = '';
          setMobileMenuOpen(false);
        }} style={{ display: 'none' }} />
      </label>

      <MenuCategory label="Integrations" />
      <button onClick={() => { setAnkiModalOpen(true); setMobileMenuOpen(false); }} style={menuItemStyle}>
        {t.ankiSettings}
      </button>

      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(128,128,128,0.1)' }}>
        <button 
          onClick={() => {
            if (window.confirm(t.confirmReset)) {
              localStorage.clear();
              window.location.reload();
            }
          }} 
          style={{ ...menuItemStyle, color: '#ff4b4b', borderBottom: 'none' }}
        >
          {t.resetReader}
        </button>
      </div>
    </>
  );

  return (
    <div style={{
      '--reader-font-size': `${aesthetics.fontSize}px`,
      '--reader-vertical-margin': `${aesthetics.verticalMargin}vh`,
      '--reader-horizontal-margin': `${aesthetics.horizontalMargin}px`,
      maxWidth: `${aesthetics.readingWidth}vw`,
      margin: '0 auto',
      height: '100vh',
      position: 'relative',
      backgroundColor: 'var(--bg-color)',
      overflow: 'hidden'
    } as any}>
      {currentView === 'reader' ? (
        <>
          <ReaderContainer 
            sentences={bookData} 
            activeIndex={activeIndex} 
            onIndexChange={setActiveIndex} 
            tapToSelect={tapToSelect}
            showArrows={showArrows}
            centerActive={centerActive}
            minedSentences={minedSentencesSet}
            bookmarks={bookmarks}
            onOpenJump={() => setJumpModalOpen(true)}
            orientation={readerOrientation}
          />
          <BottomHUD 
            metadata={metadata} 
            sentences={bookData} 
            activeIndex={activeIndex} 
            isMobile={isMobile}
            ankiField={ankiField}
            onAnkiMine={handleAnkiMine}
            onOpenJump={() => setJumpModalOpen(true)}
            isBookmarked={bookmarks.includes(activeIndex)}
            readerActions={readerActions}
            t={t}
            onOpenLibrary={() => setIsLibraryOpen(true)}
          />
        </>
      ) : (
        <StatsView stats={stats} onClose={() => setCurrentView('reader')} t={t} />
      )}
      
      {!isMobile && (
        <div 
          ref={menuRef}
          style={{
            position: 'fixed',
            top: '30px',
            left: '30px',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            opacity: mobileMenuOpen ? 1 : 0.3,
            transition: 'opacity 0.3s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => { if (!mobileMenuOpen) e.currentTarget.style.opacity = '0.3'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'var(--btn-bg)',
                color: 'var(--btn-text)',
                padding: '12px',
                borderRadius: '0',
                boxShadow: 'var(--btn-shadow)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MenuIcon open={mobileMenuOpen} />
            </button>
            <img src="/favicon.png" alt="Tateyomi" style={{ width: '40px', height: '40px' }} />
          </div>
          {mobileMenuOpen && (
            <div style={{
              marginTop: '8px',
              background: 'var(--btn-bg)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '220px',
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              border: '1px solid rgba(128,128,128,0.1)'
            }}>
              {renderMenuContent()}
            </div>
          )}
        </div>
      )}
      
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <div 
          ref={menuRef}
          style={{
            position: 'fixed',
            top: '15px',
            left: '15px',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              ...hudButtonStyle,
              padding: '12px',
              borderRadius: '0',
              width: '44px',
              height: '44px',
              justifyContent: 'center'
            }}
          >
            <MenuIcon open={mobileMenuOpen} />
          </button>
          
          {mobileMenuOpen && (
            <div style={{
              marginTop: '8px',
              background: 'var(--btn-bg)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '220px',
              maxWidth: 'calc(100vw - 30px)',
              maxHeight: 'calc(100vh - 80px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              border: '1px solid rgba(128,128,128,0.1)'
            }}>
              {renderMenuContent()}
            </div>
          )}
        </div>
      )}

      {!isMobile && (
        <div style={{
          position: 'fixed',
          top: '30px',
          right: '30px',
          zIndex: 2000,
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          {!isConnected ? (
            <button onClick={() => connect()} style={{ ...hudButtonStyle, opacity: 0.3 }}>
              {t.connectDrive}
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              {hasUnsavedChanges && !isPushing && (
                <div style={{ fontSize: '9px', color: '#f59e0b', textTransform: 'uppercase' }}>
                  {t.unsavedChanges}
                </div>
              )}
              {lastSynced && !hasUnsavedChanges && (
                <div style={{ fontSize: '9px', color: 'var(--text-color)', opacity: 0.4, textTransform: 'uppercase' }}>
                  {t.lastSynced || "Synced"}: {lastSynced}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleCloudPush()} disabled={isPushing || isPulling} style={{ ...hudButtonStyle, opacity: 0.3 }}>
                  {isPushing ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => handleCloudPull()} disabled={isPushing || isPulling} style={{ ...hudButtonStyle, opacity: 0.3 }}>
                  {isPulling ? 'Loading...' : 'Load'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {ankiModalOpen && (
        <AnkiSettingsModal ankiField={ankiField} onSave={setAnkiField} onClose={() => setAnkiModalOpen(false)} t={t} />
      )}

      {error && (
        <div style={{ position: 'fixed', top: 20, left: 20, color: '#ff4c4c', zIndex: 1000 }}>
          {error}
        </div>
      )}

      {isJumpModalOpen && (
        <JumpToModal currentIndex={activeIndex} totalSentences={bookData.length} onJump={handleJumpToIndex} onClose={() => setJumpModalOpen(false)} t={t} />
      )}

      {toast && (
        <div style={{
          position: 'fixed',
          top: '85px',
          right: '30px',
          padding: '16px 24px',
          background: 'var(--btn-bg)',
          color: 'var(--btn-text)',
          zIndex: 9999,
          borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
        }}>
          {toast.message}
        </div>
      )}

      {/* Library Sidebar */}
      <LibrarySidebar 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        books={library.books}
        activeBookId={library.activeBookId}
        onSelectBook={(id) => setLibrary(prev => ({ ...prev, activeBookId: id }))}
        onDeleteBook={handleDeleteBook}
        t={t}
      />

      <NotesSidebar isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} notes={notes} onNotesChange={setNotes} t={t} />

      <button
        onClick={() => setIsNotesOpen(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 2500,
          background: 'var(--btn-bg)',
          color: 'var(--btn-text)',
          width: '50px',
          height: '50px',
          borderRadius: '0',
          cursor: 'pointer',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    </div>
  );
}

export default App;
