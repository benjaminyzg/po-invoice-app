import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import QuotationList from './QuotationList';
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
    quotationRef: '',
    contactPerson: '',
    contactEmail: '',
    mobileNumber: '',
    officeNumber: '',
    entityName: '',
    countryOfOrigin: 'Singapore',
    entityAddress: '',
    entityPostalCode: '',
    incoterm: '',
    paymentTerm: '30 Days',
    validityOfQuotation: '',
    remarks: ''
  });
  const [items, setItems] = useState([
    { id: 1, description: '', quantity: 1, unitPrice: '' }
  ]);
  // 1. Add state inside QuotationFormWip
  const [editingId, setEditingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
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

        {/* --- Row 4: Commercial Terms, Validity & Origin --- */}
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

        <div className="min-w-0">
          <label style={labelStyle}>Country of Origin (Entity)</label>
          <select
            name="countryOfOrigin"
            value={formData.countryOfOrigin || 'Singapore'}
            onChange={handleInputChange}
            style={{ ...inputStyle, height: '42px' }}
          >
            <option value="Singapore">Singapore</option>
            <option value="Malaysia">Malaysia</option>
            <option value="Indonesia">Indonesia</option>
            <option value="Thailand">Thailand</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    );
  };
  // 2. Handle Edit mode population from QuotationList
  const handleEditQuotation = (quotation) => {
    setEditingId(quotation.id);
    setFormData({
      quotationRef: quotation.quotation_ref,
      contactPerson: quotation.contact_person,
      contactEmail: quotation.contact_email,
      mobileNumber: quotation.mobile_number || '',
      officeNumber: quotation.office_number || '',
      entityName: quotation.entity_name,
      entityAddress: quotation.entity_address,
      entityPostalCode: quotation.entity_postal_code,
      incoterm: quotation.incoterm || '',
      paymentTerm: quotation.payment_term || '30 Days',
      validityOfQuotation: quotation.validity_of_quotation,
      countryOfOrigin: quotation.country_of_origin || 'Singapore',
      remarks: quotation.remarks || ''
    });
    if (quotation.items && quotation.items.length > 0) {
      setItems(quotation.items.map(i => ({
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unit_price
      })));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // 3. Handle Cancel Edit action
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      quotationRef: '',
      contactPerson: '',
      contactEmail: '',
      mobileNumber: '',
      officeNumber: '',
      entityName: '',
      entityAddress: '',
      entityPostalCode: '',
      incoterm: '',
      paymentTerm: '30 Days',
      validityOfQuotation: '',
      countryOfOrigin: 'Singapore',
      remarks: ''
    });
    setItems([{ description: '', quantity: 1, unitPrice: 0.00 }]);
  };
  // 4. Update handleSubmit for dual POST / PUT support
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      quotation_ref: formData.quotationRef,
      contact_person: formData.contactPerson,
      contact_email: formData.contactEmail,
      mobile_number: formData.mobileNumber,
      office_number: formData.officeNumber,
      entity_name: formData.entityName,
      entity_address: formData.entityAddress,
      entity_postal_code: formData.entityPostalCode,
      incoterm: formData.incoterm,
      payment_term: formData.paymentTerm,
      validity_of_quotation: formData.validityOfQuotation,
      country_of_origin: formData.countryOfOrigin,
      remarks: formData.remarks,
      items: items.map(i => ({
        description: i.description,
        quantity: parseInt(i.quantity, 10),
        unit_price: parseFloat(i.unitPrice)
      }))
    };

    try {
      if (editingId) {
        await axios.put(`/api/quotations/${editingId}/`, payload);
        alert('Quotation updated successfully!');
      } else {
        await axios.post('/api/quotations/', payload);
        alert('Quotation created successfully!');
      }
      handleCancelEdit();
      setRefreshKey(prev => prev + 1); // Trigger automatic table refresh
    } catch (error) {
      console.error('Error saving quotation:', error.response?.data || error.message);
      alert('Failed to save quotation.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Create Quotation</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {renderEntityFields()}

        <hr className="my-6 border-gray-200" />

        {/* --- Line Items Section --- */}
<div style={{ marginTop: '24px', marginBottom: '24px' }}>
  <label style={{ ...labelStyle, fontSize: '15px', marginBottom: '12px' }}>
    Quotation Line Items
  </label>
  
  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
    <thead>
      <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
        <th style={{ padding: '8px', fontSize: '13px', fontWeight: 'bold' }}>Description</th>
        <th style={{ padding: '8px', fontSize: '13px', fontWeight: 'bold', width: '90px' }}>Qty</th>
        <th style={{ padding: '8px', fontSize: '13px', fontWeight: 'bold', width: '120px' }}>Unit Price ($)</th>
        <th style={{ padding: '8px', fontSize: '13px', fontWeight: 'bold', width: '120px', textAlign: 'right' }}>Total Amount ($)</th>
        <th style={{ padding: '8px', width: '40px' }}></th>
      </tr>
    </thead>
    <tbody>
      {items.map((item, index) => {
        const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
        return (
          <tr key={index} style={{ borderBottom: '1px solid #edf2f7' }}>
            <td style={{ padding: '8px 4px' }}>
              <input
                type="text"
                placeholder="Item Description"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                style={inputStyle}
                required
              />
            </td>
            <td style={{ padding: '8px 4px' }}>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                style={{ ...inputStyle, textAlign: 'center' }}
                required
              />
            </td>
            <td style={{ padding: '8px 4px' }}>
              <input
                type="number"
                step="0.01"
                min="0"
                value={item.unitPrice}
                onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                style={{ ...inputStyle, textAlign: 'right' }}
                required
              />
            </td>
            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', fontSize: '14px' }}>
              ${lineTotal.toFixed(2)}
            </td>
            <td style={{ padding: '8px 4px', textAlign: 'center' }}>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  style={{
                    backgroundColor: '#fed7d7',
                    color: '#c53030',
                    border: 'none',
                    borderRadius: '4px',
                    width: '28px',
                    height: '28px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ✕
                </button>
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>

  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <button
      type="button"
      onClick={addLineItem}
      style={{
        padding: '8px 16px',
        backgroundColor: '#4a5568',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '13px'
      }}
    >
      + Add Line Item
    </button>
    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a202c' }}>
      Grand Total: ${grandTotal.toFixed(2)}
    </div>
  </div>
</div>

{/* --- Remarks / Notes Section --- */}
<div style={{ marginBottom: '24px' }}>
  <label style={labelStyle}>Remarks / Notes:</label>
  <textarea
    name="remarks"
    rows={3}
    value={formData.remarks || ''}
    onChange={handleInputChange}
    placeholder="Enter any remarks, payment terms, or quotation notes..."
    style={{ ...inputStyle, height: 'auto', resize: 'vertical' }}
  />
</div>

{/* --- Submit Button --- */}
<div style={{ textAlign: 'right' }}>
  <button
    type="submit"
    style={{
      padding: '10px 24px',
      backgroundColor: '#3182ce',
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '15px',
      fontWeight: 'bold',
      cursor: 'pointer'
    }}
  >
    Create Quotation
  </button>
</div>
      </form>

{/* Place QuotationList below </form> */}
    <QuotationList 
      onEditQuotation={handleEditQuotation} 
      refreshKey={refreshKey} 
    />

    </div>
  );
}