import React from 'react';

type ButtonVariant = 'hud' | 'menu' | 'ghost' | 'destructive' | 'pill';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  active?: boolean;
  fullWidth?: boolean;
  as?: React.ElementType; // Support for polymorphic rendering
}

const getVariantStyles = (variant: ButtonVariant, active?: boolean): React.CSSProperties => {
  const common: React.CSSProperties = {
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: variant === 'menu' ? 'flex-start' : 'center',
    fontFamily: "'Inter', 'system-ui', sans-serif",
    transition: 'all 0.2s ease',
    borderRadius: '0',
    outline: 'none',
  };

  switch (variant) {
    case 'hud':
      return {
        ...common,
        background: 'var(--btn-bg)',
        color: 'var(--btn-text)',
        padding: '10px 16px',
        fontSize: '12px',
        fontWeight: '600',
        boxShadow: 'var(--btn-shadow)',
        opacity: active ? 1 : 0.4,
      };
    case 'menu':
      return {
        ...common,
        width: '100%',
        padding: '12px 24px',
        background: 'transparent',
        borderBottom: '1px solid rgba(128,128,128,0.1)',
        color: 'var(--btn-text)',
        fontSize: '14px',
        textAlign: 'left',
      };
    case 'destructive':
      return {
        ...common,
        width: '100%',
        padding: '12px 24px',
        background: 'transparent',
        borderBottom: '1px solid rgba(128,128,128,0.1)',
        color: '#ff4b4b',
        fontSize: '14px',
        textAlign: 'left',
      };
    case 'pill':
      return {
        ...common,
        background: 'var(--btn-bg)',
        color: 'var(--btn-text)',
        padding: '12px',
        boxShadow: 'var(--btn-shadow)',
      };
    case 'ghost':
    default:
      return {
        ...common,
        background: 'transparent',
        color: 'var(--btn-text)',
        padding: '8px 12px',
      };
  }
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'ghost',
  icon,
  iconPosition = 'left',
  loading,
  active,
  fullWidth,
  as: Component = 'button',
  children,
  style,
  disabled,
  ...props
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const baseStyles = getVariantStyles(variant, active || isHovered);
  
  const finalStyles: React.CSSProperties = {
    ...baseStyles,
    width: fullWidth ? '100%' : baseStyles.width,
    opacity: (disabled || loading) ? 0.5 : baseStyles.opacity,
    pointerEvents: (disabled || loading) ? 'none' : 'auto',
    backgroundColor: isHovered && variant === 'menu' ? 'rgba(128,128,128,0.05)' : baseStyles.backgroundColor,
    ...style,
  };

  return (
    <Component
      style={finalStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {loading && (
        <svg 
          className="spinner" 
          width="14" height="14" viewBox="0 0 24 24" 
          style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }}
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="31.4" />
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span style={{ marginRight: children ? '8px' : '0', display: 'flex' }}>{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span style={{ marginLeft: children ? '8px' : '0', display: 'flex' }}>{icon}</span>
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Component>
  );
};
