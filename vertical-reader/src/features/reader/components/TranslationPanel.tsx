import React, { useState, useEffect } from 'react';
import { updateLastCard } from '../../anki/utils/ankiConnect';
import type { BookMetadata } from '../../../types';

const TranslateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8l6 6" />
    <path d="M4 14l6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="M22 22l-5-10-5 10" />
    <path d="M14 18h6" />
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const AnkiIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" />
    <path d="M12 8v8" />
    <path d="M8 12h8" />
  </svg>
);

interface TranslationPanelProps {
  activeSentence: string;
  isMobile?: boolean;
  metadata?: BookMetadata;
  ankiField?: string;
}

export const TranslationPanel: React.FC<TranslationPanelProps> = ({ activeSentence, isMobile = false, metadata, ankiField = '' }) => {
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ankiLoading, setAnkiLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-clear translation output when the active sentence turns to a new one
  useEffect(() => {
    setTranslation(null);
  }, [activeSentence]);

  const handleCopy = async () => {
    if (!activeSentence || !activeSentence.trim()) return;
    try {
      await navigator.clipboard.writeText(activeSentence);
      setToast({ message: 'Copied to clipboard!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to copy', type: 'error' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleAnki = async () => {
    if (!ankiField || !ankiField.trim()) {
      setToast({ message: 'Set Anki field in ☰ menu first', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setAnkiLoading(true);
    try {
      const msg = await updateLastCard(metadata, ankiField);
      setToast({ message: msg, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Anki update failed', type: 'error' });
    } finally {
      setAnkiLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleTranslate = async () => {
    if (!activeSentence || !activeSentence.trim()) return;
    setLoading(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q=${encodeURIComponent(activeSentence)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data[0]) {
        // Map deeply nested Google API array blocks to construct the complete string
        const translatedText = data[0].map((item: any) => item[0]).join('');
        setTranslation(translatedText);
      } else {
        setTranslation('Translation failed.');
      }
    } catch (err) {
      console.error(err);
      setTranslation('Network error during translation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleTranslate}
            title="Translate Active Sentence"
            style={{
              background: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              padding: '8px 12px',
              borderRadius: '0', 
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: 'var(--btn-shadow)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.4,
              transition: 'opacity 0.3s ease, background 0.3s, color 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
            disabled={loading}
          >
            <div style={{ 
              animation: loading ? 'spin 1s linear infinite' : 'none', 
              display: 'flex', 
              alignItems: 'center' 
            }}>
              <TranslateIcon />
            </div>
          </button>
  
          <button 
            onClick={handleCopy}
            title="Copy Active Sentence"
            style={{
              background: 'var(--btn-bg)',
              color: 'var(--btn-text)',
              padding: '8px 12px',
              borderRadius: '0', 
              cursor: 'pointer',
              boxShadow: 'var(--btn-shadow)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.4,
              transition: 'opacity 0.3s ease, background 0.3s, color 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
          >
            <CopyIcon />
          </button>

          {!isMobile && (
            <button 
              onClick={handleAnki}
              title="Update Latest Anki Card"
              style={{
                background: 'var(--btn-bg)',
                color: 'var(--btn-text)',
                padding: '8px 12px',
                borderRadius: '0', 
                cursor: ankiLoading ? 'wait' : 'pointer',
                boxShadow: 'var(--btn-shadow)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.4,
                transition: 'opacity 0.3s ease, background 0.3s, color 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
              disabled={ankiLoading}
            >
              <div style={{ 
                animation: ankiLoading ? 'spin 1s linear infinite' : 'none', 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <AnkiIcon />
              </div>
            </button>
          )}
        </div>

        {translation && (
          <div style={{
            color: 'var(--text-color)',
            fontSize: '14px',
            lineHeight: 1.6,
            fontFamily: 'sans-serif',
            borderLeft: '2px solid var(--text-highlight)',
            paddingLeft: '15px',
            maxWidth: isMobile ? '80vw' : '500px',
            animation: 'fadeSlideRight 0.4s ease-out forwards'
          }}>
            <p style={{ margin: 0, opacity: 0.9, textShadow: 'var(--text-shadow)' }}>{translation}</p>
          </div>
        )}
      </div>

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--btn-bg)',
          color: 'var(--btn-text)',
          padding: '10px 20px',
          borderRadius: '0',
          borderLeft: `3px solid ${toast.type === 'success' ? '#4caf50' : '#ef5350'}`,
          boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
          zIndex: 9999,
          fontSize: '14px',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          animation: 'fadeSlideUpToast 0.3s ease-out forwards'
        }}>
          {toast.message}
        </div>
      )}
    </>
  );
};
