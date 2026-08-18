import React from 'react';

export default function PoLineItems({ items, handleItemChange, handleAddItem, handleRemoveItem }) {
  return (
    <div>
      <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333', display: 'block', marginBottom: '8px', textAlign: 'center' }}>
        Enter Purchase Order Record
      </label>
      <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '0 0 12px 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '3.5fr 0.8fr 1.2fr 0.9fr 1.3fr 32px', gap: '8px', marginBottom: '6px', padding: '0 2px' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#444', textAlign: 'center' }}>Description</span>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#444', textAlign: 'center' }}>Qty</span>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#444', textAlign: 'center' }}>Unit Price ($)</span>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#444', textAlign: 'center' }}>Cur ($)</span>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#444', textAlign: 'center' }}>Total Amt ($)</span>
        <span></span>
      </div>

      {items.map((item, index) => {
        const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);

        return (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: '3.5fr 0.8fr 1.2fr 0.9fr 1.3fr 32px', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Item Description"
              value={item.description}
              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }}
            />
            <input
              type="number"
              min="1"
              placeholder="1"
              value={item.qty}
              onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', textAlign: 'center' }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={item.unitPrice}
              onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }}
            />
            <select
              value={item.currency}
              onChange={(e) => handleItemChange(index, 'currency', e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' }}
            >
              <option value="SGD">SGD</option>
              <option value="USD">USD</option>
              <option value="MYR">MYR</option>
              <option value="JPY">JPY</option>
            </select>
            <div style={{ padding: '8px', borderRadius: '4px', backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', fontSize: '13px', fontWeight: '600', textAlign: 'right', whiteSpace: 'nowrap' }}>
              {item.currency} ${lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              disabled={items.length === 1}
              style={{
                width: '32px',
                height: '35px',
                backgroundColor: items.length === 1 ? '#e0e0e0' : '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: items.length === 1 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={handleAddItem}
        style={{ marginTop: '4px', padding: '6px 12px', backgroundColor: '#6c757d', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
      >
        + Add Item
      </button>
    </div>
  );
}