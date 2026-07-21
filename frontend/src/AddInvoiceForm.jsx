import React, { useState, useEffect } from 'react';

function AddInvoiceForm({ token, onInvoiceAdded, editData = {}, setEditData}) {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: 1, unit_price: 0 }]);

  useEffect(() => {
    if (editData && editData.id) {
      setInvoiceNumber(editData.invoice_number || '');
      setVendorName(editData.vendor_name || '');
      // ... repeat for other fields
    } else {
      // Clear fields when not editing
      setInvoiceNumber('');
      setVendorName('');
    }
  }, [editData?.id]); // <--- Key change here!

  const addItem = () => setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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

    const invoiceData = {
      invoice_number: invoiceNumber,
      vendor_name: vendorName,
      amount: parseFloat(amount),
      status: status,
      due_date: dueDate,
      po_number: poNumber,
      vendor_address: address,
      item_description: description
    };

    const payload = {
    ...invoiceData,
    items: items 
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/invoices/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setInvoiceNumber('');
        setVendorName('');
        setAmount('');
        setDueDate('');
        onInvoiceAdded(); // Tells App.jsx to refresh the list!
        alert("Invoice saved successfully!");
      } else {
        const errorData = await response.json();
        console.log("Server error details:", errorData); // Look at this in the console
        setError(JSON.stringify(errorData));
      }
    } catch (err) {
      setError('Failed to submit invoice to the backend server.');
    }
  };

  // --- ADD inputStyle HERE ---
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

  return (
    <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
      <h4>Add New Invoice</h4>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px' }}>
  <input
    type="text"
    placeholder="Invoice Number"
    value={invoiceNumber}
    onChange={(e) => setInvoiceNumber(e.target.value)}
    style={inputStyle}
  />
  <input
    type="text"
    placeholder="Vendor Name"
    value={vendorName}
    onChange={(e) => setVendorName(e.target.value)}
    style={inputStyle}
  />
  <input
    type="text"
    inputMode="decimal"
    placeholder="Amount ($) e.g. 1500.00"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    style={inputStyle}
  />
  <input
    type="date"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
    style={inputStyle}
  />
  <input
    placeholder="PO Number"
    value={poNumber}
    onChange={(e) => setPoNumber(e.target.value)}
    style={inputStyle}
  />
  <input
    placeholder="Vendor Address"
    value={address}
    onChange={(e) => setAddress(e.target.value)}
    style={inputStyle}
  />
  <textarea
    placeholder="Item Description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    style={{ ...inputStyle, minHeight: '60px', fontFamily: 'inherit' }}
  />
  <select
    value={status}
    onChange={(e) => setStatus(e.target.value)}
    style={inputStyle}
  >
    <option value="PENDING">Pending</option>
    <option value="PAID">Paid</option>
    <option value="CANCELLED">Cancelled</option>
  </select>

  <button type="submit" style={{ backgroundColor: '#28a745', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
    Save Invoice
  </button>
</form>
    </div>    
  );
}
export default AddInvoiceForm;