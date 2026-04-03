import React, { useState, useEffect } from 'react';
import styles from './NotesSidebar.module.css';

interface NotesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  t: any;
}

export const NotesSidebar: React.FC<NotesSidebarProps> = ({ 
  isOpen, 
  onClose, 
  notes, 
  onNotesChange,
  t
}) => {
  const [localNotes, setLocalNotes] = useState(notes);

  // Sync local notes with props when they change (e.g. from cloud pull)
  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  // Debounce sync back to parent to avoid lag
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localNotes !== notes) {
        onNotesChange(localNotes);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [localNotes, onNotesChange, notes]);

  return (
    <>
      <div 
        className={`${styles.overlay} ${isOpen ? styles.visible : ''}`} 
        onClick={onClose}
      />
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t.notes || 'Notes'}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close notes">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          <textarea
            className={styles.textarea}
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            placeholder={t.notesPlaceholder || "Write your notes here..."}
            spellCheck={false}
          />
        </div>
      </div>
    </>
  );
};
