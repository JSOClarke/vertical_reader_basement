import { useState, useEffect, useRef } from 'react';
import { useMediaQuery } from './hooks/useMediaQuery';
import { ReaderContainer } from './features/reader/components/ReaderContainer';
import { BottomHUD } from './features/reader/components/BottomHUD';
import { AnkiSettingsModal } from './features/anki/components/AnkiSettingsModal';
import { StatsView } from './features/stats/components/StatsView';
import { SAMPLE_DATA } from './data/mockBook';
import { translations } from './localization/translations';
import type { Language } from './localization/translations';
import type { BookMetadata, UserProfile } from './types';
import './App.css'; 

const PROFILE_STORAGE_KEY = 'vertical-reader-profile';

function loadSavedProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
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

  const [bookData, setBookData] = useState<string[]>(saved.current?.sentences ?? SAMPLE_DATA);
  const [activeIndex, setActiveIndex] = useState<number>(saved.current?.activeIndex ?? 0);
  const [metadata, setMetadata] = useState<BookMetadata | undefined>(saved.current?.metadata);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalCharactersRead: saved.current?.stats?.totalCharactersRead ?? 0,
    readingDays: saved.current?.stats?.readingDays ?? [],
  });
  const [currentView, setCurrentView] = useState<'reader' | 'stats'>('reader');
  const prevIndexRef = useRef<number>(activeIndex);

  // Responsive Layout Overrides
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Anki
  const [ankiField, setAnkiField] = useState(saved.current?.ankiField ?? '');
  const [ankiModalOpen, setAnkiModalOpen] = useState(false);

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
        const profile: UserProfile = { sentences: bookData, activeIndex, metadata, ankiField, stats };
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      } catch {
        // localStorage full or unavailable — silently ignore
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [bookData, activeIndex, metadata, ankiField, stats]);

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
  }, [activeIndex, bookData]);

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

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark'|'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <>
      {currentView === 'reader' ? (
        <>
          <ReaderContainer 
            sentences={bookData} 
            activeIndex={activeIndex} 
            onIndexChange={setActiveIndex} 
            tapToSelect={tapToSelect}
            showArrows={showArrows}
          />
          
          <BottomHUD 
            metadata={metadata} 
            sentences={bookData} 
            activeIndex={activeIndex} 
            isMobile={isMobile}
            ankiField={ankiField}
          />
        </>
      ) : (
        <StatsView stats={stats} onClose={() => setCurrentView('reader')} t={t} />
      )}
      
      {!isMobile && (
        <div style={{
          position: 'fixed',
          top: '30px',
          right: '30px',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          opacity: mobileMenuOpen ? 1 : 0.3,
          transition: 'opacity 0.3s ease'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => { if (!mobileMenuOpen) e.currentTarget.style.opacity = '0.3'; }}
        >
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              padding: '10px 15px',
              borderRadius: '0',
              boxShadow: 'var(--btn-shadow)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: 'sans-serif'
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          {mobileMenuOpen && (
            <div style={{
              marginTop: '5px',
              background: 'var(--btn-bg)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '180px',
              overflow: 'hidden'
            }}>
              <button onClick={() => { toggleTheme(); }} style={menuItemStyle}>
                {theme === 'dark' ? t.lightMode : t.darkMode}
              </button>
              <button onClick={() => { toggleLanguage(); }} style={menuItemStyle}>
                {language === 'en' ? '🌐 Language: EN' : '🌐 言語: 日本語'}
              </button>
              <button onClick={() => { toggleTapToSelect(); }} style={menuItemStyle}>
                {tapToSelect ? `● ${t.tapSelect}` : `○ ${t.tapSelect}`}
              </button>
              <button onClick={() => { toggleArrows(); }} style={menuItemStyle}>
                {showArrows ? `● ${t.showArrows}` : `○ ${t.showArrows}`}
              </button>
              <button onClick={() => { setCurrentView('stats'); setMobileMenuOpen(false); }} style={menuItemStyle}>
                {t.viewStats}
              </button>
              <button
                onClick={() => {
                  if (bookData.length === 0) { alert(t.noDataLoaded); return; }
                  const profile = { sentences: bookData, activeIndex, metadata, ankiField, stats };
                  const blob = new Blob([JSON.stringify(profile)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `reader-profile-${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                  setMobileMenuOpen(false);
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
                        if (json.ankiField) setAnkiField(json.ankiField);
                        if (json.stats) setStats(json.stats);
                        setError(null);
                      } else { alert(t.invalidProfile); }
                    } catch { alert(t.failedParseProfile); }
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
              <button
                onClick={() => { setAnkiModalOpen(true); setMobileMenuOpen(false); }}
                style={menuItemStyle}
              >
                {t.ankiSettings}
              </button>
            </div>
          )}
        </div>
      )}

      {isMobile && (
        <div style={{
          position: 'fixed',
          top: '15px',
          right: '15px',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              padding: '10px 15px',
              borderRadius: '0',
              boxShadow: 'var(--btn-shadow)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: 'sans-serif'
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          {mobileMenuOpen && (
            <div style={{
              marginTop: '5px',
              background: 'var(--btn-bg)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '180px',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => { toggleTheme(); }}
                style={menuItemStyle}
              >
                {theme === 'dark' ? t.lightMode : t.darkMode}
              </button>
              <button onClick={() => { toggleLanguage(); }} style={menuItemStyle}>
                {language === 'en' ? '🌐 Language: EN' : '🌐 言語: 日本語'}
              </button>
              <button
                onClick={() => { toggleTapToSelect(); }}
                style={menuItemStyle}
              >
                {tapToSelect ? `● ${t.tapSelect}` : `○ ${t.tapSelect}`}
              </button>
              <button
                onClick={() => { toggleArrows(); }}
                style={menuItemStyle}
              >
                {showArrows ? `● ${t.showArrows}` : `○ ${t.showArrows}`}
              </button>
              <button onClick={() => { setCurrentView('stats'); setMobileMenuOpen(false); }} style={menuItemStyle}>
                {t.viewStats}
              </button>
              <button
                onClick={() => {
                  if (bookData.length === 0) { alert(t.noDataLoaded); return; }
                  const profile = { sentences: bookData, activeIndex, metadata, ankiField, stats };
                  const blob = new Blob([JSON.stringify(profile)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `reader-profile-${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                  setMobileMenuOpen(false);
                }}
                style={menuItemStyle}
              >
                {t.exportProfile}
              </button>
              <label style={{ ...menuItemStyle, cursor: 'pointer' }}>
                {t.importProfile}
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={(e) => {
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
                          if (json.ankiField) setAnkiField(json.ankiField);
                          if (json.stats) setStats(json.stats);
                          setError(null);
                        } else { alert(t.invalidProfile); }
                      } catch { alert(t.failedParseProfile); }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                    setMobileMenuOpen(false);
                  }}
                  style={{ display: 'none' }} 
                />
              </label>
              <label style={{ ...menuItemStyle, cursor: 'pointer' }}>
                {t.loadEpub}
                <input 
                  type="file" 
                  accept=".epub" 
                  onChange={async (e) => {
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
                  }}
                  style={{ display: 'none' }} 
                />
              </label>
              <button
                onClick={() => { setAnkiModalOpen(true); setMobileMenuOpen(false); }}
                style={menuItemStyle}
              >
                {t.ankiSettings}
              </button>
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
    </>
  );
}

const menuItemStyle: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--btn-text)',
  padding: '14px 20px',
  border: 'none',
  borderBottom: '1px solid rgba(128,128,128,0.15)',
  fontSize: '14px',
  fontFamily: 'sans-serif',
  fontWeight: '500',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
  display: 'block',
  width: '100%',
};

export default App;
