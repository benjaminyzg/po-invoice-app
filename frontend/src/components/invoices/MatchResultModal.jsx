import React from 'react';

export const MatchResultModal = ({ result, onClose }) => {
  if (!result) return null;

  const isMatched = result.match_status === 'MATCHED';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
        <h3 style={{ marginTop: 0 }}>3-Way Match Result: {result.invoice_number}</h3>
        
        <div style={{
          padding: '12px',
          borderRadius: '4px',
          fontWeight: 'bold',
          marginBottom: '16px',
          backgroundColor: isMatched ? '#d4edda' : '#f8d7da',
          color: isMatched ? '#155724' : '#721c24'
        }}>
          Status: {result.match_status} (PO: {result.po_number})
        </div>

        {result.discrepancies.length === 0 ? (
          <p>All line item prices, quantities, and totals match the Purchase Order perfectly.</p>
        ) : (
          <div>
            <h4 style={{ margin: '8px 0' }}>Flagged Discrepancies ({result.summary.total_discrepancies}):</h4>
            <ul style={{ paddingLeft: '20px', color: '#721c24' }}>
              {result.discrepancies.map((d, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>
                  <strong>{d.type}</strong> — {d.description}<br />
                  <small>
                    {d.type === 'PRICE_VARIANCE' && `Inv Price: $${d.invoice_unit_price} vs PO Price: $${d.po_unit_price} (Diff: +$${d.difference})`}
                    {d.type === 'QUANTITY_VARIANCE' && `Inv Qty: ${d.invoice_qty} vs PO Qty: ${d.po_qty} (Diff: +${d.difference})`}
                    {d.type === 'UNMATCHED_ITEM' && d.detail}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: '20px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  );
};