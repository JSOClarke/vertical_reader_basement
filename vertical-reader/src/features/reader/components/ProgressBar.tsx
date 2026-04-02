import React, { useState, useMemo } from 'react';

interface ProgressBarProps {
  sentences: string[];
  activeIndex: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ sentences, activeIndex }) => {
  const [mode, setMode] = useState<'sentences' | 'characters'>('sentences');

  const totalSentences = sentences.length;
  
  const totalCharacters = useMemo(() => {
    return sentences.reduce((acc, s) => acc + s.length, 0);
  }, [sentences]);
  
  const currentCharacters = useMemo(() => {
    let count = 0;
    for (let i = 0; i <= activeIndex && i < sentences.length; i++) {
        count += sentences[i].length;
    }
    return count;
  }, [sentences, activeIndex]);

  if (totalSentences === 0) return null;

  let displayLabel = '';
  let percentage = 0;

  if (mode === 'sentences') {
    percentage = totalSentences > 1 ? (activeIndex / (totalSentences - 1)) * 100 : 100;
    // 句 = 'Phrase/Sentence' for thematic Japanese fit
    displayLabel = `${activeIndex + 1} / ${totalSentences} 句`; 
  } else {
    percentage = totalCharacters > 0 ? (currentCharacters / totalCharacters) * 100 : 100;
    // 字 = 'Character'
    displayLabel = `${currentCharacters} / ${totalCharacters} 字`; 
  }

  return (
    <div 
      onClick={() => setMode(m => m === 'sentences' ? 'characters' : 'sentences')}
      title={`Click to switch right to ${mode === 'sentences' ? 'characters' : 'sentences'}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        cursor: 'pointer'
      }}
    >
      <div 
        style={{
          width: '150px',
          height: '4px',
          background: 'rgba(128, 128, 128, 0.3)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}
      >
        <div 
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: 'var(--text-highlight)',
            transition: 'width 0.3s ease',
            boxShadow: 'var(--text-shadow)'
          }}
        />
      </div>
      <span style={{ 
        color: 'var(--text-color)', 
        fontSize: '12px', 
        fontFamily: 'monospace',
        fontWeight: 'bold',
        userSelect: 'none',
        whiteSpace: 'nowrap'
      }}>
        {displayLabel}
      </span>
    </div>
  );
};
