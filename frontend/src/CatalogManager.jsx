import React, { useState, useEffect } from 'react';

function CatalogManager({ token }) {
  const [catalog, setCatalog] = useState([]);
  const [description, setDescription] = useState('');
  const [defaultQuantity, setDefaultQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');
  const [error, setError] = useState('');

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    color: '#333333',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  // 1. Load catalog items from backend
  const fetchCatalog = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/catalog-items/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCatalog(data);
      }
    } catch (err) {
      setError('Failed to load catalog items.');
    }
  };

  useEffect(() => {
    if (token) fetchCatalog();
  }, [token]);

  // 2. Add a new standard item
  const handleAddItem = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      description,
      default_quantity: parseInt(defaultQuantity, 10),
      unit_price: parseFloat(unitPrice)
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/catalog-items/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setDescription('');
        setDefaultQuantity(1);
        setUnitPrice('');
        fetchCatalog(); // Refresh list
      } else {
        setError('Failed to save item. Check input fields.');
      }
    } catch (err) {
      setError('Error connecting to backend server.');
    }
  };

  // 3. Delete an item
  const handleDeleteItem = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/catalog-items/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) fetchCatalog();
    } catch (err) {
      setError('Failed to delete item.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Predefined Item Catalog</h2>
      <p style={{ color: '#666' }}>Define standard products and pricing available for quick selection in invoices.</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Form to Add New Predefined Item */}
      <form onSubmit={handleAddItem} style={{ display: 'grid', gap: '10px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h4>Add Standard Item</h4>
        <input
          type="text"
          placeholder="Item Description (e.g. Standard Servicing)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={inputStyle}
          required
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number"
            placeholder="Default Quantity"
            value={defaultQuantity}
            onChange={(e) => setDefaultQuantity(e.target.value)}
            style={inputStyle}
            min="1"
            required
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder="Unit Price ($)"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            style={inputStyle}
            required
          />
        </div>
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Add To Catalog
        </button>
      </form>

      {/* Catalog Table */}
      <h4>Saved Standard Items</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '8px' }}>Description</th>
            <th style={{ padding: '8px' }}>Std. Qty</th>
            <th style={{ padding: '8px' }}>Unit Price ($)</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {catalog.length === 0 ? (
            <tr><td colSpan="4" style={{ padding: '15px', textAlign: 'center', color: '#888' }}>No predefined items created yet.</td></tr>
          ) : (
            catalog.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{item.description}</td>
                <td style={{ padding: '8px' }}>{item.default_quantity}</td>
                <td style={{ padding: '8px' }}>${parseFloat(item.unit_price).toFixed(2)}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>
                  <button onClick={() => handleDeleteItem(item.id)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CatalogManager;