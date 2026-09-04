import React, { useState, useEffect } from 'react';
import api from './services/api';
import CatalogForm from './CatalogForm';

function CatalogManager({ token }) {
  const [catalog, setCatalog] = useState([]);
  const [description, setDescription] = useState('');
  const [defaultQuantity, setDefaultQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);

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
      const res = await api.get('/catalog-items/');
      // Handle potential pagination wrappers (results array vs direct array)
      const data = res.data.results ? res.data.results : res.data;
      setCatalog(data);
    } catch (err) {
      setError('Failed to load catalog items.');
    }
  };
  useEffect(() => {
    if (token) fetchCatalog();
  }, [token]);
  
  // CSV Export Handler
  const handleExportCSV = () => {
    if (catalog.length === 0) {
      alert('No catalog items to export.');
      return;
    }
    const headers = ['SKU', 'Name', 'Description', 'Std Qty', 'Unit Price', 'Packing Dimensions', 'Gross Weight'];
    const rows = catalog.map(item => [
      item.sku,
      `"${item.name || ''}"`,
      `"${item.description || ''}"`,
      item.default_quantity,
      item.unit_price,
      `"${item.packing_dimensions || ''}"`,
      item.gross_weight || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'catalog_items.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',');

      let successCount = 0;
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const currentLine = lines[i].split(',');
        
        // Basic mapping assuming standard column order: SKU, Name, Description, Std Qty, Unit Price
        const itemData = {
          sku: currentLine[0]?.trim(),
          name: currentLine[1]?.replace(/"/g, '').trim(),
          description: currentLine[2]?.replace(/"/g, '').trim(),
          default_quantity: parseInt(currentLine[3]?.trim()) || 1,
          unit_price: parseFloat(currentLine[4]?.trim()) || 0.0,
          packing_dimensions: currentLine[5]?.replace(/"/g, '').trim() || '',
          gross_weight: parseFloat(currentLine[6]?.trim()) || 0.0,
        };

        try {
          await api.post('/catalog-items/', itemData);
          successCount++;
        } catch (err) {
          console.error(`Failed to import row ${i}:`, err.response?.data);
        }
      }
      alert(`CSV Import completed. Successfully imported ${successCount} items.`);
      fetchCatalog();
    };
    reader.readAsText(file);
  };
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
  const handleItemCreated = (newItem) => {
    setItems((prevItems) => [newItem, ...prevItems]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Predefined Item Catalog</h2>
      <h2>Catalog & SKU Management</h2>
      <p style={{ color: '#666' }}>Define standard products and pricing available for quick selection in invoices.</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Render CatalogForm */}
      <CatalogForm onItemCreated={handleItemCreated} />

      {/* Form to Add New Predefined Item */}
      {/* <form onSubmit={handleAddItem} style={{ display: 'grid', gap: '10px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
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
      </form> */}

      {/* Catalog Table */}
      <h4>Saved Standard Items</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '10px' }}>SKU</th>
            <th style={{ padding: '10px' }}>Description</th>
            <th style={{ padding: '10px' }}>Std. Qty</th>
            <th style={{ padding: '10px' }}>Packing Dimensions</th>
            <th style={{ padding: '10px' }}>Unit Price ($)</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {catalog.length === 0 ? (
            <tr><td colSpan="4" style={{ padding: '15px', textAlign: 'center', color: '#888' }}>No predefined items created yet.</td></tr>
          ) : (
            catalog.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{item.sku}<span style={{ color: '#666', fontSize: '0.9em' }}>{item.description}</span></td>
                <td style={{ padding: '8px' }}>{item.description}</td>
                <td style={{ padding: '8px' }}>{item.default_quantity}</td>
                <td style={{ padding: '10px', fontSize: '0.9em' }}>
                  Dims: {item.length && item.width && item.height ? `${item.length}x${item.width}x${item.height} cm` : '-'}<br />
                  Wt: {item.weight ? `${item.weight} kg` : '-'}
                </td>
                <td style={{ padding: '8px' }}>
                  ${parseFloat(item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '8px', textAlign: 'center' }}>
                  <button onClick={() => handleDeleteItem(item.id)} 
                  style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
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