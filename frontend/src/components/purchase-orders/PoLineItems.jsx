import React from 'react';

export default function PoLineItems({
  items = [],
  handleItemChange,
  handleAddItem,
  handleRemoveItem
}) {
  // Shared style matching PoHeaderDetails fields
  const inputStyle = {
    width: '100%',
    height: '38px',
    padding: '6px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    fontSize: '14px',
    fontFamily: 'inherit'
  };

  return (
    <div>
      <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333', display: 'block', marginBottom: '8px', textAlign: 'center' }}>
        Enter Purchase Order Record
      </label>
      <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '0 0 12px 0' }} />

      {/* Grid Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '3.5fr 0.8fr 1.2fr 0.9fr 1.3fr 32px', gap: '8px', marginBottom: '6px' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#444', textAlign: 'center' }}>Description</span>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#444', textAlign: 'center' }}>Qty</span>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#444', textAlign: 'center' }}>Unit Price ($)</span>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#444', textAlign: 'center' }}>Cur ($)</span>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#444', textAlign: 'center' }}>Total Amt ($)</span>
        <span></span>
      </div>

      {/* Item Rows */}
      {items.map((item, index) => {
        const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);

        return (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: '3.5fr 0.8fr 1.2fr 0.9fr 1.3fr 32px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Item Description"
              value={item.description || ''}
              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              required
              style={inputStyle}
            />

            <input
              type="number"
              min="1"
              value={item.qty || ''}
              onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
              required
              style={{ ...inputStyle, textAlign: 'center' }}
            />

            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={item.unitPrice || ''}
              onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
              required
              style={inputStyle}
            />

            <select
              value={item.currency || 'SGD'}
              onChange={(e) => handleItemChange(index, 'currency', e.target.value)}
              style={{ ...inputStyle, backgroundColor: '#fff' }}
            >
              <option value="SGD">SGD</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>

            <div style={{ ...inputStyle, backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {item.currency || 'SGD'} ${lineTotal.toFixed(2)}
            </div>

            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              style={{
                height: '38px',
                width: '32px',
                backgroundColor: '#e2e8f0',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#666'
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
        style={{
          marginTop: '8px',
          padding: '6px 12px',
          backgroundColor: '#6c757d',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px'
        }}
      >
        + Add Item
      </button>
    </div>
  );
}