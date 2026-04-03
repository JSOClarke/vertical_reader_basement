import { useState, useEffect, useCallback } from 'react';
import { useMediaQuery } from './hooks/useMediaQuery';
import { ReaderContainer } from './features/reader/components/ReaderContainer';
import { BottomHUD } from './features/reader/components/BottomHUD';
import { AnkiSettingsModal } from './features/anki/components/AnkiSettingsModal';
import { JumpToModal } from './features/reader/components/JumpToModal';
import { StatsView } from './features/stats/components/StatsView';
import { useReaderActions } from './features/reader/hooks/useReaderActions';
import { useAnki } from './features/anki/hooks/useAnki';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useProfileStore } from './features/profile/store/useProfileStore';
import { useBookStore } from './features/reader/store/useBookStore';
import { useReaderStore } from './features/reader/store/useReaderStore';
import { CloudHUD } from './features/cloud/components/CloudHUD';
import { SettingsOverlay } from './features/reader/components/SettingsOverlay';
import { translations } from './localization/translations';
import './App.css'; 

/**
 * Main Application Orchestrator.
 * Refactored to follow "Smart Component" architecture where logic is decentralized into hooks/stores.
 */
function App() {
  // Global Store Access
  const activeIndex = useProfileStore(state => state.activeIndex);
  const setActiveIndex = useProfileStore(state => state.setActiveIndex);
  const bookmarks = useProfileStore(state => state.bookmarks);
  const toggleBookmark = useProfileStore(state => state.toggleBookmark);
  const theme = useProfileStore(state => state.theme);
  const language = useProfileStore(state => state.language);
  const ankiField = useProfileStore(state => state.ankiField);

  const bookData = useBookStore(state => state.sentences);
  const metadata = useBookStore(state => state.metadata);

  const showToast = useReaderStore(state => state.showToast);
  const clearTranslation = useReaderStore(state => state.clearTranslation);
  const t = (translations as any)[language];

  // UI State
  const [currentView, setCurrentView] = useState<'reader' | 'stats'>('reader');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ankiModalOpen, setAnkiModalOpen] = useState(false);
  const [isJumpModalOpen, setJumpModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const handleOpenJump = useCallback(() => setJumpModalOpen(true), []);

  // Specialized Hooks
  const readerActions = useReaderActions();
  const { mineSentence } = useAnki(showToast, t);

  // Sync theme with document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Keyboard Shortcuts (Centralized in App for global listener)
  useKeyboardShortcuts({
    'T': () => readerActions.translate(bookData[activeIndex]),
    'C': () => readerActions.copy(bookData[activeIndex], showToast, t),
    'A': () => mineSentence(bookData[activeIndex]),
    'B': () => toggleBookmark(activeIndex),
    'Escape': () => clearTranslation(),
  });

  // Prepare custom CSS variables
  const readerStyles = {
    '--reader-font-size': `${useProfileStore.getState().aesthetics.fontSize}px`,
    '--reader-vertical-margin': `${useProfileStore.getState().aesthetics.verticalMargin}vh`,
    '--reader-horizontal-margin': `${useProfileStore.getState().aesthetics.horizontalMargin}px`,
    maxWidth: `${useProfileStore.getState().aesthetics.readingWidth}vw`,
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
          <ReaderContainer onOpenJump={handleOpenJump} clearTranslation={clearTranslation} />
          <BottomHUD isMobile={isMobile} onOpenJump={handleOpenJump} />
        </>
      ) : (
        <StatsView onClose={() => setCurrentView('reader')} t={t} />
      )}
      
      {!isMobile && <CloudHUD />}

      <SettingsOverlay 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
        isMobile={isMobile}
        setCurrentView={setCurrentView}
        setAnkiModalOpen={setAnkiModalOpen}
        setError={setError}
      />

      {ankiModalOpen && (
        <AnkiSettingsModal 
          ankiField={ankiField} 
          onSave={(f) => useProfileStore.getState().setAnkiField(f)} 
          onClose={() => setAnkiModalOpen(false)} 
          t={t} 
        />
      )}

      {/* Mobile Progress Header */}
      {isMobile && bookData.length > 0 && (
        <div onClick={handleOpenJump} style={{ position: 'fixed', top: '18px', right: '20px', zIndex: 1500, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', opacity: 0.4, cursor: 'pointer' }}>
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
        <JumpToModal 
          currentIndex={activeIndex} 
          totalSentences={bookData.length} 
          onJump={(i) => { setActiveIndex(i); setJumpModalOpen(false); }} 
          onClose={() => setJumpModalOpen(false)} 
          t={t} 
        />
      )}
    </div>
  );
}

export default App;
