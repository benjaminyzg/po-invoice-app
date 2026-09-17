import api from '../services/api';
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
  const [historyModalItem, setHistoryModalItem] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [catalogItems, setCatalogItems] = useState([]);

  // 2. Handle Soft Delete / Toggle Active
  const handleToggleActive = async (item) => {
    const res = await fetch(`${baseUrl}/catalog-items/${item.id}/`, {
      method: 'PATCH',
      headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !item.is_active })
    });
    if (res.ok) fetchCatalog();
  };
  // 3. Handle Edit Form Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${baseUrl}/catalog-items/${editItem.id}/`, {
      method: 'PUT',
      headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(editItem)
    });
    if (res.ok) {
      setEditItem(null);
      fetchCatalog();
    }
  };
  const handleViewHistory = async (item) => {
    setHistoryModalItem(item);
    const res = await fetch(`${baseUrl}/catalog-items/${item.id}/price-history/`, {
      headers: { 'Authorization': `Token ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setPriceHistory(data);
    }
  };
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
  const handleCatalogSelect = (e) => {
      const selectedId = e.target.value;
      const item = catalogItems.find(i => i.id === parseInt(selectedId));
      if (!item) return;

      // Auto-fill active line item state
      setLineItem({
        description: item.name + (item.description ? ` - ${item.description}` : ''),
        unitPrice: item.unit_price,
        quantity: 1,
        totalAmount: (1 * item.unit_price).toFixed(2)
      });
  };
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/catalog-items/${id}/`, {
        method: 'DELETE',
        // headers: {
        //   'Authorization': `Bearer ${token}`, // Use the token prop directly
        //   'Content-Type': 'application/json',
        // },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access') || localStorage.getItem('token')}`,          
        },
      });
      if (response.ok) {
        // setCatalogItems(catalogItems.filter((item) => item.id !== id));
        setItems(items.filter((item) => item.id !== id));
      } else {
        console.error('Failed to delete catalog item');
      }
    } catch (error) {
      console.error('Error deleting catalog item:', error);
    }
  };
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Token ${token}`
  });
  const fetchCatalogItems = async () => {
    try {
      const response = await api.get('/catalog-items/?active_only=true');
      // setCatalogItems(response.data);
      setItems(response.data.results || response.data);
    } catch (error) {
      console.error('Error loading catalog items:', error);
    }
  };
  // const fetchCatalog = async () => {
  //   try {
  //     const res = await fetch(`${baseUrl}/catalog-items/`, {
  //       headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`},
  //     });
  //     if (res.ok) {
  //       const data = await res.json();
  //       setItems(data);
  //     }
  //   } catch (err) {
  //     console.error('Error fetching catalog items:', err);
  //   }
  // };
  useEffect(() => {
    fetchCatalogItems();
  }, []); 
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
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            📥 Export CSV
          </button>
          
          <button
            onClick={() => fileInputRef.current.click()}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            📤 Import CSV
          </button>

          <input type="file" ref={fileInputRef} accept=".csv" onChange={handleImport} style={{ display: 'none' }} />

          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
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
              <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
              <button onClick={() => handleViewHistory(item)} style={{ marginRight: '4px', padding: '4px 8px', fontSize: '12px' }}>📈 History</button>
              <button onClick={() => setEditItem(item)} style={{ marginRight: '4px', padding: '4px 8px', fontSize: '12px' }}>✏️ Edit</button>
              <button onClick={() => handleToggleActive(item)} style={{ padding: '4px 8px', fontSize: '12px' }}>
                {item.is_active ? '🚫 Deactivate' : '✅ Activate'}
              </button>
            </td>
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

      {historyModalItem && (
      <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
    
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
            Price History — {historyModalItem.name} ({historyModalItem.sku})
          </h3>
          <button
            onClick={() => setHistoryModalItem(null)}
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {priceHistory.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', margin: '20px 0' }}>
              No price revisions recorded yet for this item.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Date</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Old Price</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>New Price</th>
                </tr>
              </thead>
              <tbody>
                {priceHistory.map((h) => (
                  <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}>
                      {new Date(h.changed_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#dc2626' }}>
                      ${Number(h.old_price).toFixed(2)}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>
                      ${Number(h.new_price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        {editItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleEditSubmit} style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '400px' }}>
            <h3>Edit Catalog Item</h3>
            <input type="text" value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} placeholder="Name" required style={{ width: '100%', marginBottom: '8px', padding: '8px' }} />
            <input type="text" value={editItem.category} onChange={e => setEditItem({...editItem, category: e.target.value})} placeholder="Category" style={{ width: '100%', marginBottom: '8px', padding: '8px' }} />
            <input type="number" step="0.01" value={editItem.unit_price} onChange={e => setEditItem({...editItem, unit_price: e.target.value})} placeholder="Unit Price" required style={{ width: '100%', marginBottom: '8px', padding: '8px' }} />
            <textarea value={editItem.description} onChange={e => setEditItem({...editItem, description: e.target.value})} placeholder="Description" style={{ width: '100%', marginBottom: '12px', padding: '8px' }} />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setEditItem(null)}>Cancel</button>
              <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '4px' }}>Save Changes</button>
            </div>
          </form>
        </div>
      )}
      </div>
    </div>
)}

    </div>
  );
}