import React from 'react';

export default function InvoiceHeaderDetails({
  invoiceNumber,
  setInvoiceNumber,
  vendor,
  setVendor,
  issuedDate,
  setIssuedDate,
  poNumber,
  setPoNumber,
  status,
  setStatus
}) {
  const fieldStyle = {
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
    display: 'block',
    textAlign: 'center',
    marginBottom: '5px',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#333'
  };

  return (
    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
      <div style={{ flex: 1 }}>
        <label style={labelStyle}>Invoice Number *</label>
        <input
          type="text"
          value={invoiceNumber || ''}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder="e.g. INV-1001"
          required
          style={fieldStyle}
        />
      </div>

      <div style={{ flex: 1 }}>
        <label style={labelStyle}>Vendor Name *</label>
        <input
          type="text"
          value={vendor || ''}
          onChange={(e) => setVendor(e.target.value)}
          placeholder="e.g. Vendor Name Pte Ltd"
          required
          style={fieldStyle}
        />
      </div>

      <div style={{ flex: 1 }}>
        <label style={labelStyle}>Issued Date *</label>
        <input
          type="date"
          value={issuedDate || ''}
          onChange={(e) => setIssuedDate(e.target.value)}
          required
          style={fieldStyle}
        />
      </div>

      <div style={{ flex: 1 }}>
        <label style={labelStyle}>PO Number (Optional)</label>
        <input
          type="text"
          value={poNumber || ''}
          onChange={(e) => setPoNumber(e.target.value)}
          placeholder="PO-9901"
          style={fieldStyle}
        />
      </div>
    </div>
  );
}