import { useState, useEffect } from 'react';
import { useMediaQuery } from './hooks/useMediaQuery';
import { ReaderContainer } from './features/reader/components/ReaderContainer';
import { BottomHUD } from './features/reader/components/BottomHUD';
import { SAMPLE_DATA } from './data/mockBook';
import type { BookMetadata } from './types';
import './App.css'; 

function App() {
  const [bookData, setBookData] = useState<string[]>(SAMPLE_DATA);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [metadata, setMetadata] = useState<BookMetadata | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Responsive Layout Overrides
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const showExtraUI = !isMobile || mobileMenuOpen;

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
      <ReaderContainer sentences={bookData} activeIndex={activeIndex} onIndexChange={setActiveIndex} />
      
      <BottomHUD 
        metadata={metadata} 
        sentences={bookData} 
        activeIndex={activeIndex} 
        isMobile={isMobile}
        showExtraUI={showExtraUI}
      />
      
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
                {theme === 'dark' ? '☀ Light Mode' : '● Dark Mode'}
              </button>
              <button
                onClick={() => {
                  if (bookData.length === 0) { alert("No data loaded!"); return; }
                  const profile = { sentences: bookData, activeIndex, metadata };
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
                Export Profile
              </button>
              <label style={{ ...menuItemStyle, cursor: 'pointer' }}>
                Import Profile
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
                        setError(null);
                      } else { alert('Invalid profile format.'); }
                    } catch { alert('Failed to parse profile.'); }
                  };
                  reader.readAsText(file);
                  e.target.value = '';
                  setMobileMenuOpen(false);
                }} style={{ display: 'none' }} />
              </label>
              <label style={{ ...menuItemStyle, cursor: 'pointer' }}>
                Load EPUB
                <input type="file" accept=".epub" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const { parseEpub } = await import('./features/epub/utils/epubParser');
                    const data = await parseEpub(file);
                    if (data.sentences.length === 0) {
                      setError("No text found in EPUB.");
                    } else {
                      setBookData(data.sentences);
                      setMetadata(data.metadata);
                      setActiveIndex(0);
                      setError(null);
                    }
                  } catch (err: any) {
                    setError(err.message || "Failed to parse EPUB");
                  }
                  e.target.value = '';
                  setMobileMenuOpen(false);
                }} style={{ display: 'none' }} />
              </label>
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
                {theme === 'dark' ? '☀ Light Mode' : '● Dark Mode'}
              </button>
              <button
                onClick={() => {
                  if (bookData.length === 0) { alert("No data loaded!"); return; }
                  const profile = { sentences: bookData, activeIndex, metadata };
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
                Export Profile
              </button>
              <label style={{ ...menuItemStyle, cursor: 'pointer' }}>
                Import Profile
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
                          setError(null);
                        } else { alert('Invalid profile format.'); }
                      } catch { alert('Failed to parse profile.'); }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                    setMobileMenuOpen(false);
                  }}
                  style={{ display: 'none' }} 
                />
              </label>
              <label style={{ ...menuItemStyle, cursor: 'pointer' }}>
                Load EPUB
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
                        setError("No text found in EPUB.");
                      } else {
                        setBookData(data.sentences);
                        setMetadata(data.metadata);
                        setActiveIndex(0);
                        setError(null);
                      }
                    } catch (err: any) {
                      setError(err.message || "Failed to parse EPUB");
                    }
                    e.target.value = '';
                    setMobileMenuOpen(false);
                  }}
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          )}
        </div>
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
