import React, { useState, useEffect } from 'react';
import CardContainer from './common/CardContainer';
import Button from './common/Button';

export default function CatalogItems({ token, baseUrl }) {
  console.log('CatalogItems token:', token); 
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(''); 
  const [showModal, setShowModal] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ sku: '', name: '', category: '', unit_price: '', description: '' });
  const fileInputRef = React.useRef(null);

  const handleExport = async () => {
  const res = await fetch(`${baseUrl}/catalog-items/export-csv/`, {
    headers: { 'Authorization': `Token ${token}` }
  });
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'catalog_items.csv';
  a.click();
  };
  const handleImport = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${baseUrl}/catalog-items/import-csv/`, {
    method: 'POST',
    headers: { 'Authorization': `Token ${token}` },
    body: formData
  });

  if (res.ok) {
    alert('Catalog imported successfully!');
    fetchCatalog();
  } else {
    alert('Failed to import CSV.');
  }
  };
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Token ${token}`
  });
  const fetchCatalog = async () => {
    try {
      const res = await fetch(`${baseUrl}/catalog-items/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Error fetching catalog items:', err);
    }
  };
  useEffect(() => { fetchCatalog(); }, []);
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${baseUrl}/catalog-items/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ sku: '', name: '', category: '', unit_price: '', description: '' });
        fetchCatalog();
      }
    } catch (err) {
      console.error('Error creating item:', err);
    }
  };
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase()) ||
    (i.category && i.category.toLowerCase().includes(search.toLowerCase()))
  );
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
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Catalog Management</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>Maintain standard items, prices, and SKUs.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleExport}
            style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontWeight: '500' }}
          >
            📥 Export CSV
          </button>
          <button
            onClick={() => fileInputRef.current.click()}
            style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontWeight: '500' }}
          >
            📤 Import CSV
          </button>
          <input type="file" ref={fileInputRef} accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
          <button
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: '#2563eb', color: '#fff', padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Add Catalog Item
          </button>
        </div>
      </div>
      <input
        type="text"
        placeholder="Search by SKU, name, or category..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '20px' }}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', color: '#666', fontSize: '12px' }}>
            <th style={{ padding: '12px' }}>SKU</th>
            <th style={{ padding: '12px' }}>ITEM NAME</th>
            <th style={{ padding: '12px' }}>CATEGORY</th>
            <th style={{ padding: '12px' }}>UNIT PRICE</th>
            <th style={{ padding: '12px' }}>DESCRIPTION</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.sku}</td>
              <td style={{ padding: '12px' }}>{item.name}</td>
              <td style={{ padding: '12px' }}>{item.category || '—'}</td>
              <td style={{ padding: '12px' }}>${parseFloat(item.unit_price).toFixed(2)}</td>
              <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>{item.description || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '450px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Add Catalog Item</h2>
            <form onSubmit={handleCreate}>
              <input type="text" placeholder="SKU (e.g. LAP-001)" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} required style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="Item Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <input type="text" placeholder="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <input type="number" step="0.01" placeholder="Unit Price ($)" value={formData.unit_price} onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })} required style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '16px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}