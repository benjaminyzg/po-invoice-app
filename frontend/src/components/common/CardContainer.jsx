import React from 'react';

export default function CardContainer({ title, subtitle, children, maxWidth = '100%' }) {
  return (
    <div style={{
        width: '100%',
        maxWidth: maxWidth,
        margin: '0 auto 24px auto',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}
    >
      {title && (
        <div style={{
          borderBottom: '1px solid #f3f4f6',
          backgroundColor: '#fafafa',
          padding: '16px 24px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div style={{ padding: '24px' }}>
        {children}
      </div>
    </div>
  );
}