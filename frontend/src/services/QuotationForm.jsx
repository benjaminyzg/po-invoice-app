import React, { useState, useEffect } from 'react';
import { quotationService } from '../services/quotationService';

export default function QuotationForm() {
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  
  // Form State
  const [clientName, setClientName] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState('');
  const [items, setItems] = useState([{ catalog_item: '', quantity: 1, unit_price: '' }]);

  useEffect(() => {
    // Load payment term templates and catalog items on mount
    quotationService.getPaymentTerms().then(setPaymentTerms).catch(console.error);
    quotationService.getCatalogItems().then(setCatalogItems).catch(console.error);
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // If selecting a catalog item, auto-populate the standard master unit price
    if (field === 'catalog_item') {
      const selectedCatalog = catalogItems.find(ci => ci.id === parseInt(value));
      if (selectedCatalog) {
        newItems[index].unit_price = selectedCatalog.unit_price;
      }
    }
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { catalog_item: '', quantity: 1, unit_price: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        client_name: clientName,
        valid_until: validUntil,
        payment_term: selectedPaymentTerm || null,
        items: items.map(i => ({
          catalog_item: parseInt(i.catalog_item),
          quantity: parseInt(i.quantity),
          unit_price: parseFloat(i.unit_price)
        }))
      };

      const result = await quotationService.createQuotation(payload);
      alert(`Quotation #${result.id} successfully created!`);
    } catch (error) {
      console.error("Error creating quotation:", error.response?.data || error.message);
      alert("Failed to create quotation. Check console for validation details.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Create New Quotation</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Client Name</label>
        <input 
          type="text" 
          value={clientName} 
          onChange={(e) => setClientName(e.target.value)} 
          required 
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Valid Until</label>
          <input 
            type="date" 
            value={validUntil} 
            onChange={(e) => setValidUntil(e.target.value)} 
            required 
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Term Template</label>
          <select 
            value={selectedPaymentTerm} 
            onChange={(e) => setSelectedPaymentTerm(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          >
            <option value="">Select Payment Term...</option>
            {paymentTerms.map(term => (
              <option key={term.id} value={term.id}>{term.name} ({term.due_days} Days)</option>
            ))}
          </select>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-2">Line Items (Locked to Master Catalog Pricing)</h3>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 mb-2 items-center">
          <select 
            value={item.catalog_item} 
            onChange={(e) => handleItemChange(index, 'catalog_item', e.target.value)}
            required
            className="flex-1 border rounded-md p-2"
          >
            <option value="">Select Catalog Item...</option>
            {catalogItems.map(ci => (
              <option key={ci.id} value={ci.id}>{ci.name} - ${ci.unit_price}</option>
            ))}
          </select>
          <input 
            type="number" 
            placeholder="Qty" 
            value={item.quantity} 
            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
            min="1"
            required
            className="w-20 border rounded-md p-2"
          />
          <input 
            type="number" 
            placeholder="Price" 
            value={item.unit_price} 
            onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
            step="0.01"
            required
            className="w-28 border rounded-md p-2 bg-gray-50"
          />
        </div>
      ))}
      
      <button type="button" onClick={addItemRow} className="mt-2 px-4 py-1 bg-gray-200 rounded-md text-sm">
        + Add Item
      </button>

      <div className="mt-6">
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md font-semibold hover:bg-blue-700">
          Save & Issue Quotation
        </button>
      </div>
    </form>
  );
}