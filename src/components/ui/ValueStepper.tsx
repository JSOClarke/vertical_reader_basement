import React from 'react';

interface ValueStepperProps {
  label: string;
  value: number;
  unit?: string;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  max?: number;
}

export const ValueStepper: React.FC<ValueStepperProps> = ({ 
  label, 
  value, 
  unit = '', 
  onDecrease, 
  onIncrease 
}) => {
  return (
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
        <button 
          onClick={onDecrease} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'inherit', 
            cursor: 'pointer', 
            fontSize: '18px', 
            padding: '5px',
            opacity: 0.5,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
        >
          −
        </button>
        <span style={{ minWidth: '35px', textAlign: 'center', fontWeight: 'bold' }}>{value}{unit}</span>
        <button 
          onClick={onIncrease} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'inherit', 
            cursor: 'pointer', 
            fontSize: '18px', 
            padding: '5px',
            opacity: 0.5,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
        >
          +
        </button>
      </div>
    </div>
  );
};
