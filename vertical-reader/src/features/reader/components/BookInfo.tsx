import React from 'react';
import type { BookMetadata } from '../../../types';

interface BookInfoProps {
  metadata?: BookMetadata;
}

export const BookInfo: React.FC<BookInfoProps> = ({ metadata }) => {
  if (!metadata || (!metadata.title && !metadata.coverImage)) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '60px', // Places it directly above the Progress Bar
      left: '30px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      opacity: 0.4,
      transition: 'opacity 0.3s ease',
      fontFamily: 'sans-serif'
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
    onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
    >
      {metadata.coverImage && (
        <img 
          src={metadata.coverImage} 
          style={{ 
            width: '40px', 
            height: '60px', 
            objectFit: 'cover', 
            borderRadius: '4px', 
            boxShadow: 'var(--btn-shadow)' 
          }} 
          alt="Book Cover" 
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {metadata.title && (
          <span style={{ 
            color: 'var(--text-color)', 
            fontWeight: 'bold', 
            fontSize: '14px', 
            textShadow: 'var(--text-shadow)',
            maxWidth: '250px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {metadata.title}
          </span>
        )}
        {metadata.author && (
          <span style={{ 
            color: 'var(--text-color)', 
            fontSize: '12px', 
            opacity: 0.8,
            maxWidth: '250px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {metadata.author}
          </span>
        )}
      </div>
    </div>
  );
};
