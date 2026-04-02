import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import { parseEpub } from '../utils/epubParser';

interface EpubUploaderProps {
  onSentencesLoaded: (sentences: string[]) => void;
  onError: (error: string) => void;
}

export const EpubUploader: React.FC<EpubUploaderProps> = ({ onSentencesLoaded, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const sentences = await parseEpub(file);
      if (sentences.length === 0) {
        onError("No text found in EPUB. It might be heavily image-based.");
      } else {
        onSentencesLoaded(sentences);
      }
    } catch (err: any) {
      onError(err.message || "Failed to parse EPUB");
    } finally {
      setLoading(false);
      // Reset the input so the same file can be clicked again
      e.target.value = '';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: 1000
    }}>
      <label style={{
        background: 'var(--btn-bg)',
        color: 'var(--btn-text)',
        padding: '12px 24px',
        borderRadius: '0',
        cursor: loading ? 'wait' : 'pointer',
        boxShadow: 'var(--btn-shadow)',
        fontWeight: 'bold',
        fontSize: '14px',
        fontFamily: 'sans-serif',
        opacity: 0.3,
        transition: 'opacity 0.3s ease, background 0.3s, color 0.3s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.3'}
      >
        {loading ? 'Processing...' : '+ Load EPUB'}
        <input 
          type="file" 
          accept=".epub" 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          disabled={loading}
        />
      </label>
    </div>
  );
};
