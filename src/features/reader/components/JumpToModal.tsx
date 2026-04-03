import React, { useState } from 'react';

interface JumpToModalProps {
  currentIndex: number;
  totalSentences: number;
  onJump: (index: number) => void;
  onClose: () => void;
  t: any;
}

export const JumpToModal: React.FC<JumpToModalProps> = ({ 
  currentIndex, 
  totalSentences, 
  onJump, 
  onClose, 
  t 
}) => {
  const [tempIndex, setTempIndex] = useState(currentIndex);
  const [inputVal, setInputVal] = useState((currentIndex + 1).toString());
  const [isDragging, setIsDragging] = useState(false);
  const seekRef = React.useRef<HTMLDivElement>(null);

  const updateSeek = (clientX: number) => {
    if (!seekRef.current) return;
    const rect = seekRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newIndex = Math.round(percentage * (totalSentences - 1));
    setTempIndex(newIndex);
    setInputVal((newIndex + 1).toString());
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      updateSeek(clientX);
    };

    const handleEnd = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const handleInputChange = (val: string) => {
    setInputVal(val);
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      const clamped = Math.max(0, Math.min(totalSentences - 1, num - 1));
      setTempIndex(clamped);
    }
  };

  const currentPercentage = totalSentences > 1 ? (tempIndex / (totalSentences - 1)) * 100 : 100;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'var(--bg-color)',
          color: 'var(--text-color)',
          padding: '40px',
          width: '500px',
          maxWidth: '100%',
          boxShadow: '0 30px 90px rgba(0,0,0,0.8)',
          border: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          transition: 'all 0.3s ease'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button UI */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '25px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-color)',
            fontSize: '24px',
            cursor: 'pointer',
            opacity: 0.5
          }}
        >
          ✕
        </button>

        <h3 style={{ 
          margin: '0 0 40px 0', 
          fontSize: '22px', 
          fontWeight: 300, 
          letterSpacing: '1px',
          fontFamily: 'serif'
        }}>
          {t.jumpToTitle}
        </h3>

        {/* Minimalist Progress Track */}
        <div style={{ marginBottom: '50px' }}>
          <div 
            ref={seekRef}
            onMouseDown={(e) => { setIsDragging(true); updateSeek(e.clientX); }}
            onTouchStart={(e) => { setIsDragging(true); updateSeek(e.touches[0].clientX); }}
            style={{
              height: '6px',
              width: '100%',
              background: 'rgba(128,128,128,0.1)',
              position: 'relative',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${currentPercentage}%`,
                background: 'var(--text-highlight)',
                transition: isDragging ? 'none' : 'width 0.2s cubic-bezier(0.1, 0.7, 0.1, 1)'
              }}
            />
            {/* The "Handle" */}
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: `${currentPercentage}%`,
                transform: `translate(-50%, -50%) scale(${isDragging ? 1.4 : 1})`,
                width: '14px',
                height: '14px',
                background: 'var(--bg-color)',
                border: '2px solid var(--text-highlight)',
                borderRadius: '50%',
                boxShadow: isDragging ? '0 0 15px var(--text-highlight)' : '0 2px 8px rgba(0,0,0,0.5)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                zIndex: 2
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5, fontSize: '11px', fontFamily: 'monospace' }}>
             <span>{t.jumpToSentence}: {tempIndex + 1}</span>
             <span>{Math.round(currentPercentage)}%</span>
          </div>
        </div>

        {/* Input & Action - Perfect Alignment */}
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '11px', 
              opacity: 0.4, 
              marginBottom: '10px', 
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {t.jumpToSentence}
            </label>
            <input
              type="number"
              min="1"
              max={totalSentences}
              value={inputVal}
              onChange={e => handleInputChange(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onJump(tempIndex); }}
              autoFocus
              style={{
                width: '100%',
                padding: '10px 0',
                background: 'transparent',
                color: 'var(--text-color)',
                border: 'none',
                borderBottom: '2px solid rgba(128, 128, 128, 0.3)',
                fontSize: '28px',
                fontFamily: 'monospace',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderBottomColor = 'var(--text-highlight)'}
              onBlur={(e) => e.target.style.borderBottomColor = 'rgba(128, 128, 128, 0.3)'}
            />
          </div>
          <button
            onClick={() => onJump(tempIndex)}
            style={{
              background: 'var(--text-highlight)',
              color: 'var(--bg-color)',
              border: 'none',
              padding: '12px 30px',
              fontSize: '13px',
              fontWeight: 900,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              marginBottom: '4px',
              transition: 'opacity 0.2s ease',
              boxShadow: '0 8px 15px rgba(0,0,0,0.3)'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {t.go}
          </button>
        </div>
      </div>
    </div>
  );
};
