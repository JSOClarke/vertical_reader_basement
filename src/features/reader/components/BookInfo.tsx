import React from 'react';
import type { BookMetadata } from '../../../types';

interface BookInfoProps {
  metadata?: BookMetadata;
  isMobile?: boolean;
}

export const BookInfo: React.FC<BookInfoProps> = ({ metadata, isMobile = false }) => {
  if (!metadata || (!metadata.title && !metadata.coverImage)) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      fontFamily: 'sans-serif'
    }}>
      {!isMobile && metadata.coverImage && (
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
