import React, { useState } from 'react';
import api from './services/api';

export default function CreateCatalogItem({onItemCreated}){
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
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
    payload.append('price', formData.price);

    // Append image if selected
    if (selectedFile) {
      payload.append('image', selectedFile);
    }

    try {
      // Axios will automatically set the 'Content-Type': 'multipart/form-data' header
      const response = await api.post('/catalog/', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Catalog item created successfully!');
      // Reset form or update parent state
    } catch (err) {
      console.error('Error creating catalog item:', err.response?.data || err.message);
      alert('Failed to upload catalog item.');
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="sku" placeholder="SKU" onChange={handleInputChange} required />
      <input type="text" name="name" placeholder="Item Name" onChange={handleInputChange} required />
      <input type="number" name="price" placeholder="Price" onChange={handleInputChange} required />
      
      {/* Photo Upload Input */}
      <input type="file" accept="image/*" onChange={handleFileChange} />

      <button type="submit">Save SKU</button>
    </form>
  );
}