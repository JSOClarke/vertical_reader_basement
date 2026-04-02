import React, { useState } from 'react';

interface AnkiSettingsModalProps {
  ankiField: string;
  onSave: (field: string) => void;
  onClose: () => void;
}

export const AnkiSettingsModal: React.FC<AnkiSettingsModalProps> = ({ ankiField, onSave, onClose }) => {
  const [field, setField] = useState(ankiField);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'var(--btn-bg)',
          color: 'var(--btn-text)',
          padding: '30px',
          minWidth: '320px',
          maxWidth: '90vw',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          fontFamily: 'sans-serif',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold' }}>
          Anki Settings
        </h3>
        
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', opacity: 0.7 }}>
          Target Note Field
        </label>
        <input
          type="text"
          value={field}
          onChange={e => setField(e.target.value)}
          placeholder="e.g. Back, Extra, Picture"
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'rgba(128,128,128,0.15)',
            color: 'var(--btn-text)',
            border: '1px solid rgba(128,128,128,0.3)',
            borderRadius: '0',
            fontSize: '14px',
            fontFamily: 'sans-serif',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <p style={{ fontSize: '12px', opacity: 0.5, margin: '8px 0 20px 0' }}>
          The EPUB cover image will be appended to this field on your most recent Anki card.
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: 'var(--btn-text)',
              padding: '8px 16px',
              border: '1px solid rgba(128,128,128,0.3)',
              borderRadius: '0',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'sans-serif',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(field); onClose(); }}
            style={{
              background: 'var(--btn-text)',
              color: 'var(--btn-bg)',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '0',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              fontFamily: 'sans-serif',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
