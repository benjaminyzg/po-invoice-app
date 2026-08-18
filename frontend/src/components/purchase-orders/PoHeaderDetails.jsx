import React from 'react';

export default function PoHeaderDetails({ poNumber, setPoNumber, vendor, setVendor, status, setStatus }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
      <div>
        <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px', textAlign: 'center' }}>
          PO Number
        </label>
        <input
          type="text"
          placeholder="e.g. PO-2026-001"
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
        />
      </div>

      <div>
        <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px', textAlign: 'center' }}>
          Vendor Name
        </label>
        <input
          type="text"
          placeholder="Vendor Name"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
        />
      </div>

      <div>
        <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px', textAlign: 'center' }}>
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', backgroundColor: '#fff', boxSizing: 'border-box' }}
        >
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Fulfilled</option>
          <option value="RECEIVED">Received</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
    </div>
  );
}