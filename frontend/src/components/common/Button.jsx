import React from 'react';

const VARIANTS = {
  primary: {
    backgroundColor: '#2563eb', // Standardized Primary Blue
    color: '#ffffff',
    border: '1px solid #2563eb',
  },
  secondary: {
    backgroundColor: '#f3f4f6', // Neutral light gray for "+ Add Line Item"
    color: '#374151',
    border: '1px solid #d1d5db',
  },
  success: {
    backgroundColor: '#16a34a', // Soft Green
    color: '#ffffff',
    border: '1px solid #16a34a',
  },
  danger: {
    backgroundColor: '#dc2626', // Red for Delete action
    color: '#ffffff',
    border: '1px solid #dc2626',
  }
};
export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  style = {},
  ...props
}) {
  const baseStyle = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.15s ease-in-out',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    ...VARIANTS[variant],
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={baseStyle}
      {...props}
    >
      {children}
    </button>
  );
}