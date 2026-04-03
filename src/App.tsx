import { useState, useEffect, useRef, useCallback } from 'react';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useGoogleDrive } from './hooks/useGoogleDrive';
import { ReaderContainer } from './features/reader/components/ReaderContainer';
import { BottomHUD } from './features/reader/components/BottomHUD';
import { AnkiSettingsModal } from './features/anki/components/AnkiSettingsModal';
import { JumpToModal } from './features/reader/components/JumpToModal';
import { StatsView } from './features/stats/components/StatsView';
import { useReaderActions } from './features/reader/hooks/useReaderActions';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useProfileStore } from './features/profile/store/useProfileStore';
import { useBookStore } from './features/reader/store/useBookStore';
import { CloudHUD } from './features/cloud/components/CloudHUD';
import { SettingsOverlay } from './features/reader/components/SettingsOverlay';
import { translations } from './localization/translations';
import type { UserProfile } from './types';
import './App.css'; 

function App() {
  const { isConnected, isPushing, isPulling, lastSynced, connect, push, pull } = useGoogleDrive();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // High-performance atomic selectors (prevents unnecessary re-renders)
  const activeIndex = useProfileStore(state => state.activeIndex);
  const setActiveIndex = useProfileStore(state => state.setActiveIndex);
  const bookmarks = useProfileStore(state => state.bookmarks);
  const toggleBookmark = useProfileStore(state => state.toggleBookmark);
  const stats = useProfileStore(state => state.stats);
  const setStats = useProfileStore(state => state.setStats);
  const ankiField = useProfileStore(state => state.ankiField);
  const setAnkiField = useProfileStore(state => state.setAnkiField);
  const aesthetics = useProfileStore(state => state.aesthetics);
  const theme = useProfileStore(state => state.theme);
  const setTheme = useProfileStore(state => state.setTheme);
  const language = useProfileStore(state => state.language);
  const setLanguage = useProfileStore(state => state.setLanguage);
  const importProfile = useProfileStore(state => state.importProfile);

  const bookData = useBookStore(state => state.sentences);
  const metadata = useBookStore(state => state.metadata);
  const setBookData = useBookStore(state => state.setBookData);
  const setMetadata = useBookStore(state => state.setMetadata);

  const [error, setError] = useState<string | null>(null);
  const readerActions = useReaderActions(() => toggleBookmark(activeIndex));

  // HUD / Tracking
  const [currentView, setCurrentView] = useState<'reader' | 'stats'>('reader');
  const prevIndexRef = useRef<number>(activeIndex);

  // UI State
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ankiModalOpen, setAnkiModalOpen] = useState(false);
  const [isJumpModalOpen, setJumpModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setHasUnsavedChanges(true);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ja' : 'en');
    setHasUnsavedChanges(true);
  };

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const t = (translations as any)[language];

  // Track session/cloud status (using store subscriber for efficiency)
  useEffect(() => {
    const unsub = useProfileStore.subscribe(
      (state) => state,
      () => { if (isConnected) setHasUnsavedChanges(true); }
    );
    return unsub;
  }, [isConnected]);

  // Track reading stats (characters and days)
  useEffect(() => {
    const dateStr = new Date().toISOString().split('T')[0];
    
    if (bookData && activeIndex > prevIndexRef.current) {
      const addedChars = bookData
        .slice(prevIndexRef.current, activeIndex)
        .reduce((sum: number, s: string) => sum + s.length, 0);
        
      setStats((prev: any) => ({
        ...prev,
        totalCharactersRead: prev.totalCharactersRead + addedChars,
        readingDays: prev.readingDays.includes(dateStr) ? prev.readingDays : [...prev.readingDays, dateStr]
      }));
    } else {
      setStats((prev: any) => {
        if (!prev.readingDays.includes(dateStr)) return { ...prev, readingDays: [...prev.readingDays, dateStr] };
        return prev;
      });
    }
    
    prevIndexRef.current = activeIndex;
    readerActions.clearTranslation();
  }, [activeIndex, bookData, readerActions.clearTranslation, setStats]);

  const handleAnkiMine = (sentence: string) => {
    setStats((prev: any) => ({
      ...prev,
      miningHistory: [{ bookTitle: metadata?.title || t.unknownBook, sentence, timestamp: Date.now() }, ...(prev.miningHistory || [])].slice(0, 100), 
    }));
    setHasUnsavedChanges(true);
  };

  const handleCloudPush = async () => {
    // Combine state from both stores for a complete cloud profile
    const profile = {
      ...useProfileStore.getState(),
      sentences: useBookStore.getState().sentences,
      metadata: useBookStore.getState().metadata
    };
    
    const success = await push(profile as any);
    if (success) { showToast(t.cloudPushSuccess || "Sync Successful!"); setHasUnsavedChanges(false); } 
    else { showToast(t.cloudSyncError, 'error'); }
  };

  const handleCloudPull = async () => {
    const cloudData = await pull();
    if (cloudData && typeof cloudData === 'object' && confirm(t.confirmReset)) { 
      const profile = cloudData as UserProfile;
      // Split cloud data into respective stores
      if (profile.sentences) setBookData(profile.sentences);
      if (profile.metadata) setMetadata(profile.metadata);
      importProfile(profile);
      showToast(t.cloudPullSuccess);
    } else if (!cloudData) { showToast(t.cloudSyncError, 'error'); }
  };

  useKeyboardShortcuts({
    'T': () => readerActions.translate(bookData[activeIndex]),
    'C': () => readerActions.copy(bookData[activeIndex], t),
    'A': () => readerActions.mineAnki(bookData[activeIndex], metadata, ankiField, handleAnkiMine, t),
    'B': () => toggleBookmark(activeIndex),
  });

  // Prepare custom CSS variables with proper types
  const readerStyles = {
    '--reader-font-size': `${aesthetics.fontSize}px`,
    '--reader-vertical-margin': `${aesthetics.verticalMargin}vh`,
    '--reader-horizontal-margin': `${aesthetics.horizontalMargin}px`,
    maxWidth: `${aesthetics.readingWidth}vw`,
    margin: '0 auto', 
    height: '100vh', 
    position: 'relative', 
    backgroundColor: 'var(--bg-color)', 
    overflow: 'hidden'
  } as React.CSSProperties;

  return (
    <div style={readerStyles}>
      {currentView === 'reader' ? (
        <>
          <ReaderContainer onOpenJump={() => setJumpModalOpen(true)} />
          <BottomHUD 
            isMobile={isMobile} onAnkiMine={handleAnkiMine} onOpenJump={() => setJumpModalOpen(true)}
            isBookmarked={bookmarks.includes(activeIndex)} readerActions={readerActions} t={t}
          />
        </>
      ) : (
        <StatsView stats={stats} onClose={() => setCurrentView('reader')} t={t} />
      )}
      
      {/* Feature Blocks */}
      {!isMobile && (
        <CloudHUD 
          isConnected={isConnected} isPushing={isPushing} isPulling={isPulling} lastSynced={lastSynced}
          hasUnsavedChanges={hasUnsavedChanges} onConnect={connect} onPush={handleCloudPush} onPull={handleCloudPull} t={t}
        />
      )}

      <SettingsOverlay 
        mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} isMobile={isMobile} t={t}
        toggleLanguage={toggleLanguage} toggleTheme={toggleTheme} isConnected={isConnected} connect={connect}
        isPushing={isPushing} isPulling={isPulling} lastSynced={lastSynced} handleCloudPush={handleCloudPush}
        handleCloudPull={handleCloudPull} setHasUnsavedChanges={setHasUnsavedChanges} setCurrentView={setCurrentView}
        showToast={showToast} setAnkiModalOpen={setAnkiModalOpen} setError={setError}
      />

      {ankiModalOpen && (
        <AnkiSettingsModal ankiField={ankiField} onSave={setAnkiField} onClose={() => setAnkiModalOpen(false)} t={t} />
      )}

      {isMobile && bookData.length > 0 && (
        <div onClick={() => setJumpModalOpen(true)} style={{ position: 'fixed', top: '18px', right: '20px', zIndex: 1500, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', opacity: 0.4, cursor: 'pointer' }}>
          <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '0.15em', color: 'var(--text-color)', textTransform: 'uppercase' }}>
            {activeIndex + 1} <span style={{ opacity: 0.5 }}>/</span> {bookData.length}
          </div>
          <div style={{ width: '60px', height: '2px', background: 'rgba(128, 128, 128, 0.1)', overflow: 'hidden' }}>
            <div style={{ width: `${((activeIndex + 1) / bookData.length) * 100}%`, height: '100%', background: 'var(--text-highlight)', transition: 'width 0.3s ease-out' }} />
          </div>
        </div>
      )}

      {error && <div style={{ position: 'fixed', top: 20, left: 20, color: '#ff4c4c', zIndex: 1000, background: '#121212', padding: 10 }}>{error}</div>}
      
      {isJumpModalOpen && (
        <JumpToModal currentIndex={activeIndex} totalSentences={bookData.length} onJump={(i) => { setActiveIndex(i); setJumpModalOpen(false); }} onClose={() => setJumpModalOpen(false)} t={t} />
      )}

      {toast && (
        <div style={{
          position: 'fixed', top: '85px', right: '30px', padding: '16px 24px', background: 'var(--btn-bg)', color: 'var(--btn-text)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
          fontSize: '13px', fontWeight: '600', zIndex: 9999, animation: 'fadeSlideDown 0.4s ease-out forwards', display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
export default App;
