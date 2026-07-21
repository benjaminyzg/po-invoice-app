import React, { useState, useEffect } from 'react';

export default function CatalogItems({ token, baseUrl }) {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', unit_price: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Token ${token}`
  });

  const fetchCatalog = async () => {
    try {
      const res = await fetch(`${baseUrl}/catalog-items/`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load catalog items.');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${baseUrl}/catalog-items/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to add catalog item.');
      
      const newItem = await res.json();
      setItems([...items, newItem]);
      setFormData({ name: '', description: '', unit_price: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <h3>🏷️ Catalog Management</h3>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* Add Catalog Item Form */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', maxWidth: '400px', marginBottom: '25px' }}>
        <h4>Add Predefined Item</h4>
        <input
          type="text"
          placeholder="Item Name / Code"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          style={{ padding: '8px' }}
        />
        <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={{ padding: '8px' }}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Unit Price ($)"
          value={formData.unit_price}
          onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
          required
          style={{ padding: '8px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Saving...' : 'Add Catalog Item'}
        </button>
      </form>

      {/* Catalog Table */}
      <h4>Item List</h4>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8f9fa' }}>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Unit Price ($)</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No items found in catalog.</td></tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td><strong>{item.name || item.title}</strong></td>
                <td>{item.description || '-'}</td>
                <td>${item.unit_price || item.price || '0.00'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}