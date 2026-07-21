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

  return (
    <div style={{ padding: '10px 0' }}>
      <h3>📦 Purchase Orders (PO)</h3>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* Add PO Form */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', maxWidth: '400px', marginBottom: '25px' }}>
        <h4>Create New PO</h4>
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
          Create PO
        </button>
      </form>

      {/* PO List */}
      <h4>Purchase Order History</h4>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8f9fa' }}>
            <th>PO Number</th>
            <th>Vendor</th>
            <th>Amount ($)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {pos.length === 0 ? (
            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No Purchase Orders recorded.</td></tr>
          ) : (
            pos.map((po) => (
              <tr key={po.id || po.po_number}>
                <td><strong>{po.po_number}</strong></td>
                <td>{po.vendor_name}</td>
                <td>${po.total_amount || po.amount || '0.00'}</td>
                <td>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#fff',
                    backgroundColor: po.status === 'Approved' ? '#28a745' : po.status === 'Fulfilled' ? '#17a2b8' : '#ffc107'
                  }}>
                    {po.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}