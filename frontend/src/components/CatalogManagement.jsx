import React, { useState } from 'react';
import api from '../services/api';

export default function CatalogManagement() {
    const [catalogForm, setCatalogForm] = useState({
    name: '',
    sku: '',
    unit_price: '',
    hs_code: '',
    unit_weight_kg: '',
    dimensions_cm: '',
    packages_count: 1,
    });
    const [message, setMessage] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
        await api.post('/catalog/', catalogForm);
        setMessage('Catalog item saved successfully!');
        // Reset form
            setCatalogForm({
                name: '',
                sku: '',
                unit_price: '',
                hs_code: '',
                unit_weight_kg: '',
                dimensions_cm: '',
                packages_count: 1,
            });
        } catch (err) {
        console.error('Failed to save catalog item:', err);
        setMessage('Error saving item. Please try again.');
        }
    };
    return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '15px' }}>Add Catalog Item</h2>
      {message && <p style={{ marginBottom: '15px', color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Item Name</label>
          <input
            type="text"
            value={catalogForm.name}
            onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value })}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>SKU</label>
            <input
              type="text"
              value={catalogForm.sku}
              onChange={(e) => setCatalogForm({ ...catalogForm, sku: e.target.value })}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Unit Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={catalogForm.unit_price}
              onChange={(e) => setCatalogForm({ ...catalogForm, unit_price: e.target.value })}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              required
            />
          </div>

        </div>

        {/* Customs & Shipping Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>HS / Tariff Code</label>
            <input
              type="text"
              placeholder="e.g. 8471.30.00"
              value={catalogForm.hs_code}
              onChange={(e) => setCatalogForm({ ...catalogForm, hs_code: e.target.value })}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Unit Weight (kg)</label>
            <input
              type="number"
              step="0.001"
              placeholder="0.500"
              value={catalogForm.unit_weight_kg}
              onChange={(e) => setCatalogForm({ ...catalogForm, unit_weight_kg: e.target.value })}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Dimensions (LxWxH cm)</label>
            <input
              type="text"
              placeholder="30 x 20 x 10"
              value={catalogForm.dimensions_cm}
              onChange={(e) => setCatalogForm({ ...catalogForm, dimensions_cm: e.target.value })}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Total Packages / Cartons</label>
            <input
              type="number"
              value={catalogForm.packages_count}
              onChange={(e) => setCatalogForm({ ...catalogForm, packages_count: e.target.value })}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Save Catalog Item
        </button>
      </form>
    </div>
  );
}
