import React, { useState, useEffect } from 'react';

export default function PurchaseOrders({ token, baseUrl }) {
  const [pos, setPos] = useState([]);
  const [formData, setFormData] = useState({
    po_number: '',
    vendor_name: '',
    total_amount: '',
    status: 'Pending'
  });
  const [error, setError] = useState('');

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Token ${token}`
  });

  const fetchPOs = async () => {
    try {
      const res = await fetch(`${baseUrl}/purchase-orders/`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch purchase orders.');
      const data = await res.json();
      setPos(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${baseUrl}/purchase-orders/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to create purchase order.');

      const newPO = await res.json();
      setPos([...pos, newPO]);
      setFormData({ po_number: '', vendor_name: '', total_amount: '', status: 'Pending' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (poId, newStatus) => {
    try {
      const res = await fetch(`${baseUrl}/purchase-orders/${poId}/`, {
        method: 'PATCH', // or PUT depending on backend
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      // Update local state UI instantly
      setPos(pos.map(po => po.id === poId ? { ...po, status: newStatus } : po));
    } catch (err) {
      setError(err.message);
    }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <h3>📦 Purchase Orders (PO)</h3>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* Add PO Form */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', maxWidth: '400px', marginBottom: '25px' }}>
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '18px', fontWeight: '500' }}>Create New PO</span>
        </div>      
        <input
          type="text"
          placeholder="PO Number (e.g. PO-2026-001)"
          value={formData.po_number}
          onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
          required
          style={{ padding: '8px' }}
        />
        <input
          type="text"
          placeholder="Vendor Name"
          value={formData.vendor_name}
          onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
          required
          style={{ padding: '8px' }}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Total Amount ($)"
          value={formData.total_amount}
          onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
          required
          style={{ padding: '8px' }}
        />
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          style={{ padding: '8px' }}
        >
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Fulfilled">Fulfilled</option>
        </select>
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Create Purchase Order
        </button>
      </form>

      {/* PO List */}
      <h4>Purchase Order History</h4>
      {/* Line 119: Add explicit text alignment to the table wrapper */}
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f8f9fa' }}>
            <th style={{ padding: '8px', textAlign: 'center' }}>PO Number</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Vendor</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Amount ($)</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Status</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Actions</th> {/* ADD THIS */}
          </tr>
        </thead>
        <tbody>
  {pos.length === 0 ? (
    <tr>
      <td colSpan="5" style={{ textAlign: 'center', padding: '12px' }}>
        No Purchase Orders recorded.
      </td>
    </tr>
  ) : (
    pos.map((po) => (
      <tr key={po.id || po.po_number} style={{ borderBottom: '1px solid #eee' }}>
        {/* 1. PO Number */}
        <td style={{ padding: '10px 8px', textAlign: 'left' }}>
          <strong>{po.po_number}</strong>
        </td>

        {/* 2. Vendor */}
        <td style={{ padding: '10px 8px', textAlign: 'left' }}>
          {po.vendor_name}
        </td>

        {/* 3. Amount */}
        <td style={{ padding: '10px 8px', textAlign: 'left' }}>
          ${Number(po.total_amount || po.amount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </td>

        {/* 4. Status Badge */}
        <td style={{ padding: '10px 8px', textAlign: 'left' }}>
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#fff',
            backgroundColor: 
              po.status === 'Approved' ? '#28a745' : 
              po.status === 'Fulfilled' ? '#17a2b8' : 
              po.status === 'Cancelled' ? '#dc3545' : '#ffc107'
          }}>
            {po.status}
          </span>
        </td>

        {/* 5. Actions */}
        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {po.status !== 'Fulfilled' && po.status !== 'Cancelled' && (
              <button type="button" onClick={() => handleStatusChange(po.id, 'Fulfilled')}>  
                Receive
              </button>
            )}

            <button type="button" onClick={() => handleEdit(po)}>
             Edit
            </button>

            {po.status !== 'Cancelled' && (
              <button type="button" onClick={() => handleStatusChange(po.id, 'Cancelled')}>
                Cancel
              </button>
            )}
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>
      </table>
    </div>
  );
}