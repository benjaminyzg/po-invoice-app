import React from 'react';

export default function InvoiceLineItems({
  items = [],
  handleItemChange,
  handleAddItem,
  handleRemoveItem
}) {
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

  const labelStyle = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'inherit',
    textAlign: 'center',
    display: 'block'
  };

  return (
    <div style={{ marginBottom: '15px' }}>
      <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '0 0 12px 0' }} />

      {/* Grid Headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '3.5fr 0.8fr 1.2fr 1.3fr 32px',
          gap: '8px',
          marginBottom: '8px'
        }}
      >
        <span style={labelStyle}>Description</span>
        <span style={labelStyle}>Qty</span>
        <span style={labelStyle}>Unit Price</span>
        <span style={labelStyle}>Total Amt</span>
        <span></span>
      </div>

      {/* Line Item Rows */}
      {items.map((item, index) => {
        const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);

        return (
          <div
            key={index}
            style={{
              display: 'grid',
              gridTemplateColumns: '3.5fr 0.8fr 1.2fr 1.3fr 32px',
              gap: '8px',
              marginBottom: '8px',
              alignItems: 'center'
            }}
          >
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

            <div
              style={{
                ...inputStyle,
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}
            >
              ${lineTotal.toFixed(2)}
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
        + Add Line Item
      </button>
    </div>
  );
}