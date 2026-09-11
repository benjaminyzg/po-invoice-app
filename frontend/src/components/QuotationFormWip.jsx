import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import CardContainer from './common/CardContainer';

// 1. Shared style definitions
const gridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  columnGap: '16px',  // Prevents horizontal border collisions
  rowGap: '20px',     // Prevents labels from touching upper input boxes
  marginBottom: '24px'
};

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  boxSizing: 'border-box',
  fontSize: '14px',
  outline: 'none'
};

const labelStyle = {
  display: 'block',
  fontWeight: '600',
  fontSize: '13px',
  color: '#1a202c',
  marginBottom: '6px'
};

export default function QuotationFormWip() {
  const [formData, setFormData] = useState({
    entityName: '',
    entityAddress: '',
    entityPostalCode: '',
    contactPerson: '',
    contactEmail: '',
    incoterm: '',
    paymentTerm: '30 Days',
    validityOfQuotation: '',
    remarks: '',
  });
  const [items, setItems] = useState([
    { id: 1, description: '', quantity: 1, unitPrice: '' }
  ]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };
  const addLineItem = () => {
    setItems([...items, { id: items.length + 1, description: '', quantity: 1, unitPrice: '' }]);
  };
  const removeLineItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };
  const calculateSubtotal = (item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return qty * price;
  };
  const grandTotal = items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Quotation Payload:', { ...formData, items, grandTotal });
    // Add your API submission logic here
  };
  // 2. Updated helper function
  const renderEntityFields = () => {
  return (
    <div style={gridContainerStyle}>
      
      {/* --- Row 1: Quotation Ref & Primary Contact --- */}
      <div className="min-w-0">
        <label style={labelStyle}>Quotation Reference *</label>
        <input
          type="text"
          name="quotationRef"
          required
          value={formData.quotationRef || ''}
          onChange={handleInputChange}
          placeholder="e.g. QT-2026-001"
          style={inputStyle}
        />
      </div>

      <div className="min-w-0">
        <label style={labelStyle}>Contact Person *</label>
        <input
          type="text"
          name="contactPerson"
          required
          value={formData.contactPerson || ''}
          onChange={handleInputChange}
          placeholder="e.g. John Doe"
          style={inputStyle}
        />
      </div>

      <div className="min-w-0">
        <label style={labelStyle}>Contact's Email Address *</label>
        <input
          type="email"
          name="contactEmail"
          required
          value={formData.contactEmail || ''}
          onChange={handleInputChange}
          placeholder="e.g. john.doe@acmecorp.com"
          style={inputStyle}
        />
      </div>

      {/* --- Row 2: Contact Phones & Entity Name --- */}
      <div className="min-w-0">
        <label style={labelStyle}>Mobile Number</label>
        <input
          type="tel"
          name="mobileNumber"
          value={formData.mobileNumber || ''}
          onChange={handleInputChange}
          placeholder="e.g. +65 9123 4567"
          style={inputStyle}
        />
      </div>

      <div className="min-w-0">
        <label style={labelStyle}>Office Number</label>
        <input
          type="tel"
          name="officeNumber"
          value={formData.officeNumber || ''}
          onChange={handleInputChange}
          placeholder="e.g. +65 6789 0123"
          style={inputStyle}
        />
      </div>

      <div className="min-w-0">
        <label style={labelStyle}>Entity Name *</label>
        <input
          type="text"
          name="entityName"
          required
          value={formData.entityName || ''}
          onChange={handleInputChange}
          placeholder="e.g. Acme Corporation"
          style={inputStyle}
        />
      </div>

      {/* --- Row 3: Entity Address & Location Details --- */}
      <div className="min-w-0">
        <label style={labelStyle}>Entity Address *</label>
        <textarea
          name="entityAddress"
          required
          rows={3}
          value={formData.entityAddress || ''}
          onChange={handleInputChange}
          placeholder="e.g. 71 Ayer Rajah Crescent, #03-01"
          style={{ ...inputStyle, height: 'auto', resize: 'vertical' }}
        />
      </div>

      <div className="min-w-0">
        <label style={labelStyle}>Entity Postal Code *</label>
        <input
          type="text"
          name="entityPostalCode"
          required
          value={formData.entityPostalCode || ''}
          onChange={handleInputChange}
          placeholder="e.g. 138588"
          style={inputStyle}
        />
      </div>

      <div className="min-w-0">
        <label style={labelStyle}>Incoterm</label>
        <select
          name="incoterm"
          value={formData.incoterm || ''}
          onChange={handleInputChange}
          style={{ ...inputStyle, height: '42px' }}
        >
          <option value="">Select Incoterm...</option>
          <option value="EXW">EXW - Ex Works</option>
          <option value="FOB">FOB - Free on Board</option>
          <option value="CIF">CIF - Cost, Insurance & Freight</option>
          <option value="CFR">CFR - Cost and Freight</option>
          <option value="DAP">DAP - Delivered at Place</option>
          <option value="DDP">DDP - Delivered Duty Paid</option>
          <option value="DDU">DDU - Delivered Duty Unpaid</option>
        </select>
      </div>

      {/* --- Row 4: Commercial Terms & Validity --- */}
      <div className="min-w-0">
        <label style={labelStyle}>Payment / Credit Term</label>
        <select
          name="paymentTerm"
          value={formData.paymentTerm || '30 Days'}
          onChange={handleInputChange}
          style={{ ...inputStyle, height: '42px' }}
        >
          <option value="30 Days">30 Days</option>
          <option value="60 Days">60 Days</option>
          <option value="Cash">Cash</option>
        </select>
      </div>

      <div className="min-w-0">
        <label style={labelStyle}>Validity of Quotation *</label>
        <input
          type="date"
          name="validityOfQuotation"
          required
          value={formData.validityOfQuotation || ''}
          onChange={handleInputChange}
          style={{ ...inputStyle, height: '42px' }}
        />
      </div>

    </div>
  );
};

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Create Quotation</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {renderEntityFields()}

        <hr className="my-6 border-gray-200" />

        {/* Grand Total */}
        <div className="flex justify-end items-center">
          <div className="text-xl font-bold text-gray-900">
            Grand Total: ${grandTotal.toFixed(2)}
          </div>
        </div>

        {/* Remarks / Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks / Notes:</label>
          <textarea
            name="remarks"
            rows="3"
            value={formData.remarks}
            onChange={handleInputChange}
            placeholder="Enter any remarks or notes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
          >
            Create Quotation
          </button>
        </div>

        {/* Line Items Section */}
        <div>
          <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-600 uppercase mb-2 px-1">
            <div className="col-span-6">Description</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Unit Price ($)</div>
            <div className="col-span-2 text-right">Total Amount ($)</div>
          </div>

          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center mb-3">
              <div className="col-span-6">
                <input
                  type="text"
                  required
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder="Item Description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="col-span-2">
                <input
                  type="number"
                  min="1"
                  required
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="col-span-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="col-span-2 flex items-center justify-end space-x-2">
                <span className="text-sm font-medium text-gray-800">
                  ${calculateSubtotal(item).toFixed(2)}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded bg-gray-100 hover:bg-red-50 transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addLineItem}
            className="mt-2 px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition shadow-sm"
          >
            + Add Line Item
          </button>
        </div>

      </form>
    </div>
  );
}