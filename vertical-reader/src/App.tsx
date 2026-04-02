import { useState, useEffect } from 'react';
import { ReaderContainer } from './features/reader/components/ReaderContainer';
import { BottomHUD } from './features/reader/components/BottomHUD';
import { EpubUploader } from './features/epub/components/EpubUploader';
import { ProfileManager } from './features/profile/components/ProfileManager';
import { ThemeToggle } from './features/theme/components/ThemeToggle';
import { SAMPLE_DATA } from './data/mockBook';
import type { BookMetadata } from './types';
import './App.css'; 

function App() {
  const [bookData, setBookData] = useState<string[]>(SAMPLE_DATA);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [metadata, setMetadata] = useState<BookMetadata | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

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
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      <ReaderContainer sentences={bookData} activeIndex={activeIndex} onIndexChange={setActiveIndex} />
      <BottomHUD metadata={metadata} sentences={bookData} activeIndex={activeIndex} />
      <ProfileManager 
        sentences={bookData} 
        activeIndex={activeIndex} 
        metadata={metadata}
        onLoadProfile={p => {
          setBookData(p.sentences);
          setActiveIndex(p.activeIndex);
          setMetadata(p.metadata);
          setError(null);
        }} 
      />
      <EpubUploader 
        onEpubLoaded={data => {
          setBookData(data.sentences);
          setMetadata(data.metadata);
          setActiveIndex(0); // Reset index on fresh upload!
          setError(null);
        }}
        onError={setError}
      />
      {error && (
        <div style={{ position: 'fixed', top: 20, left: 20, color: '#ff4c4c', zIndex: 1000, background: '#121212', padding: 10, borderRadius: 5 }}>
          {error}
        </div>
      )}
    </>
  );
}

export default App;
