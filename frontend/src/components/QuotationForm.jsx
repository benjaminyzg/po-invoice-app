import React, { useState } from 'react';
import axios from 'axios';
import CardContainer from './common/CardContainer';

export default function QuotationFormWip() {
  const [formData, setFormData] = useState({
    quote_reference: '',
    client_name: '',
    status: 'Pending',
    payment_term: '30 Days',
    valid_until: '',
    currency: 'SGD',
    remarks: '',
    items: [{ description: '', quantity: 1, unit_price: 0.00 }]
  });

  const inputStyles = "mt-1 block w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
  const selectStyles = "mt-1 block w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

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
    if (formData.items.length === 1) return; // Keep at least one row
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  }
  // Calculate grand total
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
      alert('Failed to create quotation.');
    }
  };

  return (
    <CardContainer title="Create New Quotation">
      <div className="p-6 space-y-6 bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Quote Reference, Client Name, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Quote Reference</label>
              <input type="text" name="quote_reference" value={formData.quote_reference} onChange={handleInputChange} className={inputStyles} placeholder="Auto-generated on save" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Client Name *</label>
              <input type="text" name="client_name" value={formData.client_name} onChange={handleInputChange} className={inputStyles} placeholder="Vendor / Client Name" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className={selectStyles}>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Row 2: Valid Until, Payment Terms, Currency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Valid Until *</label>
              <input type="date" name="valid_until" value={formData.valid_until} onChange={handleInputChange} className={inputStyles} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Credit Terms</label>
              <select name="payment_term" value={formData.payment_term} onChange={handleInputChange} className={selectStyles}>
                <option value="CoD">Cash on Delivery (CoD)</option>
                <option value="30 Days">30 Days Credit</option>
                <option value="60 Days">60 Days Credit</option>
                <option value="90 Days">90 Days Credit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Currency</label>
              <select name="currency" value={formData.currency} onChange={handleInputChange} className={selectStyles}>
                <option value="SGD">SGD ($)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          {/* Itemized Quote Record Section Header */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 text-center">Enter Quotation Record</h3>
            
            <div className="overflow-x-auto border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-xs text-gray-700 uppercase font-semibold">
                  <tr>
                    <th className="px-3 py-2.5 text-left">Description</th>
                    <th className="px-3 py-2.5 text-center w-24">Quantity</th>
                    <th className="px-3 py-2.5 text-right w-36">Unit Price ($)</th>
                    <th className="px-3 py-2.5 text-right w-36">Total Amount ($)</th>
                    <th className="px-3 py-2.5 text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-sm">
                  {formData.items.map((item, index) => {
                    const rowTotal = (Number(item.quantity || 0) * Number(item.unit_price || 0)).toFixed(2);
                    return (
                      <tr key={index}>
                        <td className="px-3 py-2">
                          <input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm" placeholder="Item Description" />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-center" min="1" />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input type="number" step="0.01" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm text-right" />
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">
                          ${rowTotal}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button type="button" onClick={() => removeItemRow(index)} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs font-bold">✕</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <button type="button" onClick={addItemRow} className="px-3 py-1.5 bg-gray-700 text-white text-xs font-semibold rounded hover:bg-gray-800 transition">
                + Add Line Item
              </button>
            </div>
          </div>

          {/* Remarks / Notes Section */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Remarks / Notes</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows="3" className={inputStyles} placeholder="Add any internal remarks or notes..."></textarea>
          </div>

          {/* Total Summary Block */}
          <div className="bg-gray-100 rounded-md p-4 text-right">
            <span className="text-xs text-gray-600 uppercase font-semibold block">Total Summary:</span>
            <span className="text-lg font-bold text-gray-900">{formData.currency}: ${grandTotal.toFixed(2)}</span>
          </div>

          {/* Submit Action Button */}
          <div className="flex justify-center pt-2">
            <button type="submit" className="w-full md:w-auto px-8 py-2.5 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 shadow-sm transition">
              Create Quotation
            </button>
          </div>

        </form>
      </div>
    </CardContainer>
  );
}