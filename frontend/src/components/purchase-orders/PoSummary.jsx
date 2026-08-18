import React from 'react';

export default function PoSummary({ totalsByCurrency }) {
  return (
    <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '6px', marginTop: '5px' }}>
      <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#475569' }}>
        Total Summary:
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {Object.entries(totalsByCurrency).map(([curr, total]) => (
          <span key={curr} style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
            {curr}: ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ))}
      </div>
    </div>
  );
}