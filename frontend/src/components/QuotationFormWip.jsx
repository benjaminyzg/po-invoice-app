import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CardContainer from './common/CardContainer';

export default function QuotationFormWip() {
  const [formData, setFormData] = useState({
    quote_reference: '',
    client_name: '',
    status: 'Pending',
    valid_until: '',
    payment_term: '30 Days',
    currency: 'SGD',
    remarks: '',
    items: [{ description: '', quantity: 1, unit_price: 0.00 }]
  });

  const [error, setError] = useState(null);

  const inputStyles = "mt-1 block w-full rounded-md border border-gray-300 bg-white px-3.5 py-3.5 text-m text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
  const selectStyles = "mt-1 block w-full rounded-md border border-gray-300 bg-white px-3.5 py-3.5 text-m text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  useEffect(() => {{/* Header Form Fields matching the Purchase Orders layout structure */}
	<div className="grid grid-cols-1 md:grid-cols-3 gap-x-16"	>
		
		{/* Field 1: Quotation Reference */}
		<div className="mb-6">
			<label className="block text-xs font-bold text-gray-900 tracking-wider mb-1">Quotation Reference</label>
			<input 
				type="text" 
				name="quote_reference" 
				value={formData.quote_reference} 
				onChange={handleInputChange} 
				className={inputStyles} 
				placeholder="Auto-generated on save" 
			/>
		</div>
	
		{/* Field 2: Name Of Entity */}
		<div className="mb-4">
			<label className="block text-xs font-bold text-gray-900 tracking-wider mb-1">Name Of Entity *</label>
			<input 
				type="text" 
				name="client_name" 
				value={formData.client_name} 
				onChange={handleInputChange} 
				className={inputStyles} 
				placeholder="Entity / Client Name" 
				required 
			/>
		</div>
	
		{/* Field 3: Status */}
		<div className="mb-6">
			<label className="block text-xs font-bold text-gray-900 tracking-wider mb-1">Status</label>
			<select 
				name="status" 
				value={formData.status} 
				onChange={handleInputChange} 
				className={selectStyles}
			>
				<option value="Pending">Pending</option>
				<option value="Approved">Approved</option>
				<option value="Rejected">Rejected</option>
			</select>
		</div>
	
		{/* Field 4: Validity Of Quotation */}
		<div className="mb-6">
			<label className="block text-xs font-bold text-gray-900 tracking-wider mb-1">Validity Of Quotation *</label>
			<input 
				type="date" 
				name="valid_until" 
				value={formData.valid_until} 
				onChange={handleInputChange} 
				className={inputStyles} 
				required 
			/>
		</div>

		{/* Field 5: Payment/Credit Term */}
		<div className="mb-6">
			<label className="block text-xs font-bold text-gray-900 tracking-wider mb-1">Payment/Credit Term</label>
			<select 
				name="payment_term" 
				value={formData.payment_term} 
				onChange={handleInputChange} 
				className={selectStyles}
			>
				<option value="CoD">Cash on Delivery (CoD)</option>
				<option value="30 Days">30 Days Credit</option>
				<option value="60 Days">60 Days Credit</option>
				<option value="90 Days">90 Days Credit</option>
			</select>
		</div>
	
		{/* Field 6: Currency */}
		<div className="mb-6">
			<label className="block text-xs font-bold text-gray-900 tracking-wider mb-1">Currency</label>
			<select 
				name="currency" 
				value={formData.currency} 
				onChange={handleInputChange} 
				className={selectStyles}
			>
				<option value="SGD">SGD ($)</option>
				<option value="USD">USD ($)</option>
				<option value="EUR">EUR (€)</option>
			</select>
		</div>
	
	</div>
    // Data fetching placeholder
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0.00 }]
    }));
  };

  const removeItemRow = (index) => {
    if (formData.items.length === 1) return;
    setFormData(prev => ({
      ...prev,
      items: formData.items.filter((_, i) => i !== index)
    }));
  };

  const grandTotal = formData.items.reduce((sum, item) => {
    return sum + (Number(item.quantity || 0) * Number(item.unit_price || 0));
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/quotations/', formData);
      alert('Quotation created successfully!');
    } catch (err) {
      console.error("Error creating quotation:", err);
      setError('Failed to create quotation.');
    }
  };

  return (
    <CardContainer title="Create New Quotation">
      <div className="p-6 space-y-6 bg-white">
        {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-md">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Header Form Fields matching the Purchase Orders layout structure */}
<div className="grid grid-cols-3 md:grid-cols-2 gap-x-8">
  
  {/* Field 1: Quotation Reference */}
  <div className="mb-6">
    <label className="block text-xs font-bold text-gray-900 tracking-wider mb-1">Quotation Reference</label>
    <input 
      type="text" 
      name="quote_reference" 
      value={formData.quote_reference} 
      onChange={handleInputChange} 
      className={inputStyles} 
      placeholder="Auto-generated on save" 
    />
  </div>

  {/* Field 2: Name Of Entity */}
  <div className="mb-6">
    <label className="block text-xs font-bold text-gray-900 tracking-wider mb-1">Name Of Entity *</label>
    <input 
      type="text" 
      name="client_name" 
      value={formData.client_name} 
      onChange={handleInputChange} 
      className={inputStyles} 
      placeholder="Entity / Client Name" 
      required 
    />
  </div>

  {/* Field 3: Status */}
  <div className="mb-6">
    <label className="block text-xs font-bold text-gray-900 tracking-wider mb-1">Status</label>
    <select 
      name="status" 
      value={formData.status} 
      onChange={handleInputChange} 
      className={selectStyles}
    >
      <option value="Pending">Pending</option>
      <option value="Approved">Approved</option>
      <option value="Rejected">Rejected</option>
    </select>
  </div>

  {/* Field 4: Validity Of Quotation */}
  <div className="mb-6">
    <label className="block text-xs font-bold text-gray-900 tracking-wider mb-1">Validity Of Quotation *</label>
    <input 
      type="date" 
      name="valid_until" 
      value={formData.valid_until} 
      onChange={handleInputChange} 
      className={inputStyles} 
      required 
    />
  </div>

  {/* Field 5: Payment/Credit Term */}
  <div className="mb-6">
    <label className="block text-xs font-bold text-gray-900 tracking-wider mb-1">Payment/Credit Term</label>
    <select 
      name="payment_term" 
      value={formData.payment_term} 
      onChange={handleInputChange} 
      className={selectStyles}
    >
      <option value="CoD">Cash on Delivery (CoD)</option>
      <option value="30 Days">30 Days Credit</option>
      <option value="60 Days">60 Days Credit</option>
      <option value="90 Days">90 Days Credit</option>
    </select>
  </div>

  {/* Field 6: Currency */}
  <div className="mb-6">
    <label className="block text-xs font-bold text-gray-900 tracking-wider mb-1">Currency</label>
    <select 
      name="currency" 
      value={formData.currency} 
      onChange={handleInputChange} 
      className={selectStyles}
    >
      <option value="SGD">SGD ($)</option>
      <option value="USD">USD ($)</option>
      <option value="EUR">EUR (€)</option>
    </select>
  </div>

</div>

        </form>
      </div>
    </CardContainer>
  );
}