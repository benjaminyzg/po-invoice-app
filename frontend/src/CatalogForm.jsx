import React, { useState } from 'react';
import api from './services/api';

export default function CreateCatalogItem({onItemCreated}){
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    default_quantity: 1,
    unit_price: '',
    packing_dimensions: '',
    gross_weight: '',
    net_weight: '',
    image: null      
  });
  const [selectedFile, setSelectedFile] = useState(null);
  
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a FormData payload
    const payload = new FormData();
    payload.append('sku', formData.sku);
    payload.append('name', formData.name);
    payload.append('description', formData.description);
    payload.append('default_quantity', formData.default_quantity);
    payload.append('unit_price', formData.unit_price);
    payload.append('packing_dimensions', formData.packing_dimensions);
    payload.append('gross_weight', formData.gross_weight);
    payload.append('net_weight', formData.net_weight);

    // Append image if selected
    if (selectedFile) {
      payload.append('image', selectedFile);
    }

    try {
      // Axios will automatically set the 'Content-Type': 'multipart/form-data' header
      const response = await api.post('/catalog-items/', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Catalog item created successfully!');
      setFormData({
        sku: '',
        name: '',
        description: '',
        default_quantity: '1',
        unit_price: '',
        packing_dimensions: '',
        gross_weight: '',
      });
      setSelectedFile(null);
      if (onItemCreated) onItemCreated();
    } catch (err) {
      console.error('Error creating catalog item:', err.response?.data || err.message);
      alert('Failed to upload catalog item.');
    }
  };
  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
      <h4>Add Standard Item</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <input type="text" name="sku" placeholder="SKU (e.g. SKU-0001)" value={formData.sku} onChange={handleInputChange} required />
        <input type="text" name="name" placeholder="Item Name" value={formData.name} onChange={handleInputChange} required />
      </div>
      <textarea name="description" placeholder="Item Description / Details" value={formData.description} onChange={handleInputChange} rows="2" style={{ padding: '8px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <input type="number" name="default_quantity" placeholder="Std. Qty" value={formData.default_quantity} onChange={handleInputChange} min="1" required />
        <input type="number" step="0.01" name="unit_price" placeholder="Unit Price ($)" value={formData.unit_price} onChange={handleInputChange} required />
        <input type="text" name="packing_dimensions" placeholder="Packing Dimensions (e.g. 10x20x30 cm)" value={formData.packing_dimensions} onChange={handleInputChange} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <input type="number" step="0.01" name="gross_weight" placeholder="Gross Weight (kg)" value={formData.gross_weight} onChange={handleInputChange} />
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        + Add To Catalog
      </button>
    </form>
  );
}