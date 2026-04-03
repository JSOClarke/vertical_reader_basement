import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  active?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  children, 
  active, 
  style, 
  ...props 
}) => {
  return (
    <button 
      style={{
        background: 'var(--btn-bg)',
        color: 'var(--btn-text)',
        padding: '12px',
        borderRadius: '0',
        boxShadow: active ? 'inset 0 0 10px rgba(0,0,0,0.3)' : 'var(--btn-shadow)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
};
