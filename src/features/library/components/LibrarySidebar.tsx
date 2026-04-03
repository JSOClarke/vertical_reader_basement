import React from 'react';
import styles from './LibrarySidebar.module.css';
import type { BookEntry } from '../../../types';

interface LibrarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  books: BookEntry[];
  activeBookId?: string;
  onSelectBook: (id: string) => void;
  onDeleteBook: (id: string) => void;
  t: any;
}

export const LibrarySidebar: React.FC<LibrarySidebarProps> = ({
  isOpen,
  onClose,
  books,
  activeBookId,
  onSelectBook,
  onDeleteBook,
  t
}) => {
  return (
    <>
      <div 
        className={`${styles.overlay} ${isOpen ? styles.visible : ''}`} 
        onClick={onClose}
      />
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t.myLibrary || 'My Library'}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close library">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.bookList}>
          {books.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{t.noBooks || 'No books in library.'}</p>
            </div>
          ) : (
            books.map((book) => (
              <div 
                key={book.id} 
                className={`${styles.bookItem} ${book.id === activeBookId ? styles.active : ''}`}
                onClick={() => {
                  onSelectBook(book.id);
                  onClose();
                }}
              >
                <div className={styles.coverWrapper}>
                  {book.metadata.coverImage ? (
                    <img src={book.metadata.coverImage} alt={book.metadata.title} className={styles.cover} />
                  ) : (
                    <div className={styles.placeholderCover}>
                      <span>{book.metadata.title?.[0] || '?'}</span>
                    </div>
                  )}
                  {book.id === activeBookId && (
                    <div className={styles.activeBadge}>{t.activeBook || 'Reading'}</div>
                  )}
                </div>
                
                <div className={styles.bookInfo}>
                  <h3 className={styles.bookTitle}>{book.metadata.title || 'Untitled'}</h3>
                  <p className={styles.bookAuthor}>{book.metadata.author || 'Unknown Author'}</p>
                  <div className={styles.progressContainer}>
                    <div 
                      className={styles.progressBar} 
                      style={{ width: `${(book.progress.activeIndex / book.sentences.length) * 100}%` }}
                    />
                  </div>
                  <span className={styles.progressText}>
                    {Math.round((book.progress.activeIndex / book.sentences.length) * 100)}%
                  </span>
                </div>

                <button 
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBook(book.id);
                  }}
                  title={t.deleteBook || 'Delete Book'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
