import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useGoogleDrive } from './hooks/useGoogleDrive';
import { ReaderContainer } from './features/reader/components/ReaderContainer';
import { BottomHUD } from './features/reader/components/BottomHUD';
import { AnkiSettingsModal } from './features/anki/components/AnkiSettingsModal';
import { JumpToModal } from './features/reader/components/JumpToModal';
import { StatsView } from './features/stats/components/StatsView';
import { useReaderActions } from './features/reader/hooks/useReaderActions';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { SAMPLE_DATA } from './data/mockBook';
import { translations } from './localization/translations';
import type { Language } from './localization/translations';
import type { BookMetadata, UserProfile, UserStats, ReaderAesthetics } from './types';
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
  gap: '12px'
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
    color: 'var(--btn-text)'
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

function loadSavedProfile(): UserProfile | null {
  try {
    let raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      // Fallback for legacy users
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.sentences) && typeof parsed.activeIndex === 'number') {
      return parsed as UserProfile;
    }
  } catch {
    // corrupted data — ignore
  }
  return null;
}

function App() {
  const saved = useRef(loadSavedProfile());
  const { isConnected, isPushing, isPulling, lastSynced, connect, push, pull } = useGoogleDrive();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [bookData, setBookData] = useState<string[]>(saved.current?.sentences ?? SAMPLE_DATA);
  const [activeIndex, setActiveIndex] = useState<number>(saved.current?.activeIndex ?? 0);
  const [metadata, setMetadata] = useState<BookMetadata | undefined>(saved.current?.metadata);
  const [error, setError] = useState<string | null>(null);

  const readerActions = useReaderActions(() => handleToggleBookmark());

  const [bookmarks, setBookmarks] = useState<number[]>(saved.current?.bookmarks ?? []);

  // Stats
  const [stats, setStats] = useState<UserStats>({
    totalCharactersRead: saved.current?.stats?.totalCharactersRead ?? 0,
    readingDays: saved.current?.stats?.readingDays ?? [],
    miningHistory: saved.current?.stats?.miningHistory ?? [],
  });
  const [currentView, setCurrentView] = useState<'reader' | 'stats'>('reader');
  const prevIndexRef = useRef<number>(activeIndex);

  // Responsive Layout Overrides
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Anki
  const [ankiField, setAnkiField] = useState(saved.current?.ankiField ?? '');
  const [ankiModalOpen, setAnkiModalOpen] = useState(false);
  const [isJumpModalOpen, setJumpModalOpen] = useState(false);

  const [aesthetics, setAesthetics] = useState<ReaderAesthetics>({
    fontSize: 28,
    verticalMargin: 10,
    horizontalMargin: 40,
    readingWidth: 100,
    ...saved.current?.aesthetics
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

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

  // Language
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });

  const toggleLanguage = () => setLanguage(prev => {
    const next = prev === 'en' ? 'ja' : 'en';
    localStorage.setItem('language', next);
    return next;
  });

  const t = translations[language];

  // Auto-persist profile to localStorage (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        const profile: UserProfile = { 
          sentences: bookData, 
          activeIndex, 
          metadata, 
          ankiField, 
          stats, 
          bookmarks,
          aesthetics
        };
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
        if (isConnected) setHasUnsavedChanges(true);
      } catch {
        // localStorage full or unavailable — silently ignore
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [bookData, activeIndex, metadata, ankiField, stats, bookmarks, aesthetics, isConnected]);

  // Handle Browser Exit Confirmation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && isConnected) {
        e.preventDefault();
        e.returnValue = ''; // Trigger standard browser prompt
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isConnected]);

  // Track reading stats (characters and days)
  useEffect(() => {
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Only track if we progressed forward to avoid double-counting or backward jumps
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
      // Even if we didn't progress, we might need to log today as a reading day
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
        onDecrease={() => { setAesthetics(prev => ({ ...prev, fontSize: Math.max(12, prev.fontSize - 2) })); setHasUnsavedChanges(true); }}
        onIncrease={() => { setAesthetics(prev => ({ ...prev, fontSize: Math.min(48, prev.fontSize + 2) })); setHasUnsavedChanges(true); }}
      />
      <ValueStepper 
        label={t.verticalMarginLabel || "Top/Bottom"} 
        value={aesthetics.verticalMargin} 
        unit="vh"
        onDecrease={() => { setAesthetics(prev => ({ ...prev, verticalMargin: Math.max(0, prev.verticalMargin - 1) })); setHasUnsavedChanges(true); }}
        onIncrease={() => { setAesthetics(prev => ({ ...prev, verticalMargin: Math.min(30, prev.verticalMargin + 1) })); setHasUnsavedChanges(true); }}
      />
      <ValueStepper 
        label={t.horizontalMarginLabel || "Left/Right"} 
        value={aesthetics.horizontalMargin} 
        unit="px"
        onDecrease={() => { setAesthetics(prev => ({ ...prev, horizontalMargin: Math.max(0, prev.horizontalMargin - 5) })); setHasUnsavedChanges(true); }}
        onIncrease={() => { setAesthetics(prev => ({ ...prev, horizontalMargin: Math.min(100, prev.horizontalMargin + 5) })); setHasUnsavedChanges(true); }}
      />
      <ValueStepper 
        label={t.readingWidthLabel || "Viewing Width"} 
        value={aesthetics.readingWidth} 
        unit="%"
        onDecrease={() => { setAesthetics(prev => ({ ...prev, readingWidth: Math.max(30, prev.readingWidth - 5) })); setHasUnsavedChanges(true); }}
        onIncrease={() => { setAesthetics(prev => ({ ...prev, readingWidth: Math.min(100, prev.readingWidth + 5) })); setHasUnsavedChanges(true); }}
      />
      
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

      <MenuCategory label={t.dataActions || "Actions"} />
      <button onClick={() => { setCurrentView('stats'); setMobileMenuOpen(false); }} style={menuItemStyle}>
        {t.viewStats}
      </button>
      <button
        onClick={() => {
          if (bookData.length === 0) { alert(t.noDataLoaded); return; }
          const profile: UserProfile = { sentences: bookData, activeIndex, metadata, ankiField, stats, bookmarks, aesthetics };
          const blob = new Blob([JSON.stringify(profile)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `reader-profile-${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          URL.revokeObjectURL(url);
          setMobileMenuOpen(false);
          showToast(t.copiedToast, 'success'); // Reusing "copied" for simple export success
        }}
        style={menuItemStyle}
      >
        {t.exportProfile}
      </button>
      
      <label style={{ ...menuItemStyle, cursor: 'pointer' }}>
        {t.importProfile}
        <input type="file" accept=".json" onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            try {
              const json = JSON.parse(ev.target?.result as string);
              if (Array.isArray(json.sentences) && typeof json.activeIndex === 'number') {
                setBookData(json.sentences);
                setActiveIndex(json.activeIndex);
                setMetadata(json.metadata);
                if (json.bookmarks) setBookmarks(json.bookmarks);
                if (json.aesthetics) setAesthetics(json.aesthetics);
                setError(null);
                showToast(t.cloudPullSuccess, 'success'); // Reusing pull success for import
              } else { showToast(t.invalidProfile, 'error'); }
            } catch { showToast(t.failedParseProfile, 'error'); }
          };
          reader.readAsText(file);
          e.target.value = '';
          setMobileMenuOpen(false);
        }} style={{ display: 'none' }} />
      </label>

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
              setBookData(data.sentences);
              setMetadata(data.metadata);
              setActiveIndex(0);
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
      <button
        onClick={() => { setAnkiModalOpen(true); setMobileMenuOpen(false); }}
        style={menuItemStyle}
      >
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
      ].slice(0, 100), // Cap at 100 for minimalist performance
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
    const profile: UserProfile = { 
      sentences: bookData, 
      activeIndex, 
      metadata, 
      ankiField, 
      stats, 
      bookmarks,
      aesthetics 
    };
    const success = await push(profile);
    if (success) {
      showToast(t.cloudPushSuccess || "Sync Successful!", 'success');
      setHasUnsavedChanges(false);
    } else {
      showToast(t.cloudSyncError, 'error');
    }
  };

  const handleCloudPull = async () => {
    const cloudData = await pull();
    if (cloudData) {
      if (confirm(t.confirmReset)) { // Reusing reset confirm for simple "overwrite local?"
        setBookData(cloudData.sentences);
        setActiveIndex(cloudData.activeIndex);
        setMetadata(cloudData.metadata);
        if (cloudData.ankiField) setAnkiField(cloudData.ankiField);
        if (cloudData.stats) setStats(cloudData.stats);
        if (cloudData.bookmarks) setBookmarks(cloudData.bookmarks);
        if (cloudData.aesthetics) setAesthetics(cloudData.aesthetics);
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
    if (isConnected) setHasUnsavedChanges(true); // Track progress as "Unsaved Cloud Change"
  };

  const handleJumpToIndex = (index: number) => {
    handleActiveIndexChange(index);
    setJumpModalOpen(false);
  };

  // Tap-to-select: when off, clicking a sentence won't change the active index
  const [tapToSelect, setTapToSelect] = useState<boolean>(() => {
    const stored = localStorage.getItem('tapToSelect');
    return stored === null ? true : stored === 'true';
  });
  const toggleTapToSelect = () => setTapToSelect(prev => {
    const next = !prev;
    localStorage.setItem('tapToSelect', String(next));
    return next;
  });

  // Show-Arrows: toggle visibility of the left/right navigation arrows
  const [showArrows, setShowArrows] = useState<boolean>(() => {
    const stored = localStorage.getItem('showArrows');
    return stored === null ? true : stored === 'true';
  });
  const toggleArrows = () => setShowArrows(prev => {
    const next = !prev;
    localStorage.setItem('showArrows', String(next));
    return next;
  });

  // Center-Active: toggle automatic scrolling to the active sentence
  const [centerActive, setCenterActive] = useState<boolean>(() => {
    const stored = localStorage.getItem('centerActive');
    return stored === null ? true : stored === 'true';
  });
  const toggleCenterActive = () => setCenterActive(prev => {
    const next = !prev;
    localStorage.setItem('centerActive', String(next));
    return next;
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark'|'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <div style={{
      // @ts-ignore - CSS variables
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
                transition: 'background 0.3s',
              }}
            >
              <MenuIcon open={mobileMenuOpen} />
            </button>
            <img 
              src="/favicon.png" 
              alt="Tateyomi" 
              style={{
                width: '40px',
                height: '40px',
                boxShadow: 'var(--btn-shadow)',
                cursor: 'default'
              }}
            />
          </div>

          {mobileMenuOpen && (
            <div style={{
              marginTop: '8px',
              background: 'var(--btn-bg)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '220px',
              overflow: 'hidden',
              animation: 'fadeSlideDown 0.3s ease-out forwards',
              border: '1px solid rgba(128,128,128,0.1)'
            }}>
              {renderMenuContent()}
            </div>
          )}
        </div>
      )}
      
      {/* Cloud Sync Desktop HUD */}
      {!isMobile && (
        <div 
          style={{
            position: 'fixed',
            top: '30px',
            right: '30px',
            zIndex: 2000,
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}
        >
          {!isConnected ? (
            <button 
              onClick={() => connect()} 
              style={{ 
                ...hudButtonStyle, 
                background: 'var(--btn-bg)', 
                color: 'var(--btn-text)',
                opacity: 0.3,
                transition: 'opacity 0.3s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <path d="M17.5 19c.6 0 1.1-.4 1.3-.9.4-1 .3-2.1-.3-3-.6-.9-1.5-1.5-2.5-1.5-.1 0-.3 0-.4.1-.4-2-2.1-3.6-4.1-3.6-1.5 0-2.8.9-3.5 2.1-.3-.1-.6-.1-.9-.1-1.6 0-2.9 1.3-2.9 2.9 0 .2 0 .4.1.5-1.1.4-1.9 1.5-1.9 2.8 0 1.5 1.1 2.7 2.6 2.7h12.5z" />
              </svg>
              {t.connectDrive || "Connect Drive"}
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              {hasUnsavedChanges && !isPushing && (
                <div style={{ 
                  fontSize: '9px', 
                  letterSpacing: '0.15em', 
                  fontWeight: '300', 
                  color: '#f59e0b', 
                  opacity: 0.8,
                  textTransform: 'uppercase',
                  marginBottom: '-2px'
                }}>
                  {t.unsavedChanges || "Unsaved"}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  onClick={() => handleCloudPush()} 
                  disabled={isPushing || isPulling}
                  style={{ 
                    ...hudButtonStyle, 
                    opacity: isPushing || isPulling ? 0.6 : 0.3,
                    transition: 'opacity 0.3s ease'
                  }}
                  onMouseEnter={e => { if (!isPushing && !isPulling) e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={e => { if (!isPushing && !isPulling) e.currentTarget.style.opacity = '0.3'; }}
                  title={t.pushTitle}
                >
                  {isPushing ? '↑ Saving...' : '↑ Save'}
                </button>
                <button 
                  onClick={() => handleCloudPull()} 
                  disabled={isPushing || isPulling}
                  style={{ 
                    ...hudButtonStyle, 
                    opacity: isPushing || isPulling ? 0.6 : 0.3,
                    transition: 'opacity 0.3s ease'
                  }}
                  onMouseEnter={e => { if (!isPushing && !isPulling) e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={e => { if (!isPushing && !isPulling) e.currentTarget.style.opacity = '0.3'; }}
                  title={t.pullTitle}
                >
                  {isPulling ? '↓ Loading...' : '↓ Load'}
                </button>
                {lastSynced && (
                  <div style={{ padding: '0 10px', fontSize: '9px', opacity: 0.3, maxWidth: '60px', lineHeight: '1.1' }}>
                    Sync: {lastSynced.split(',')[1]}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

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
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <img 
              src="/favicon.png" 
              alt="Tateyomi" 
              style={{
                width: '36px',
                height: '36px',
                boxShadow: 'var(--btn-shadow)'
              }}
            />
          </div>

          {mobileMenuOpen && (
            <div style={{
              marginTop: '8px',
              background: 'var(--btn-bg)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '220px',
              overflow: 'hidden',
              animation: 'fadeSlideDown 0.3s ease-out forwards',
              border: '1px solid rgba(128,128,128,0.1)'
            }}>
              {renderMenuContent()}
            </div>
          )}
        </div>
      )}

      {ankiModalOpen && (
        <AnkiSettingsModal
          ankiField={ankiField}
          onSave={setAnkiField}
          onClose={() => setAnkiModalOpen(false)}
          t={t}
        />
      )}

      {error && (
        <div style={{ position: 'fixed', top: 20, left: 20, color: '#ff4c4c', zIndex: 1000, background: '#121212', padding: 10, borderRadius: 0 }}>
          {error}
        </div>
      )}

      {isJumpModalOpen && (
        <JumpToModal
          currentIndex={activeIndex}
          totalSentences={bookData.length}
          onJump={handleJumpToIndex}
          onClose={() => setJumpModalOpen(false)}
          t={t}
        />
      )}

      {toast && (
        <div style={{
          position: 'fixed',
          top: '85px',
          right: '30px',
          padding: '16px 24px',
          background: 'var(--btn-bg)',
          color: 'var(--btn-text)',
          fontFamily: "'Inter', 'system-ui', sans-serif",
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          borderRadius: '0',
          borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
          fontSize: '13px',
          fontWeight: '600',
          zIndex: 9999,
          animation: 'fadeSlideDown 0.4s ease-out forwards',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '80vw'
        }}>
          {toast.type === 'success' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
export default App;
