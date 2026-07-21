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
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/catalog-items/', {
          headers: { 'Authorization': `Token ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCatalog(data);
        }
      } catch (err) {
        console.error('Failed to load catalog items:', err);
      }
    };

    if (token) {
      fetchCatalog();
    }
  }, [token]);

  useEffect(() => {
    if (editData && editData.id) {
      setInvoiceNumber(editData.invoice_number || '');
      setVendorName(editData.vendor_name || '');
      setAmount(editData.amount || '');
      setStatus(editData.status || 'PENDING');
      setDueDate(editData.due_date || '');
      setPoNumber(editData.po_number || '');
      setDescription(editData.description || '');
      setAddress(editData.address || '');
      if (editData.items && editData.items.length > 0) {
        setItems(editData.items);
      }
    } else {
      // Clear fields when not editing
      setInvoiceNumber('');
      setVendorName('');
      setAmount('');
      setStatus('PENDING');
      setDueDate('');
      setPoNumber('');
      setDescription('');
      setAddress('');
      setItems([{ description: '', quantity: 1, unit_price: 0 }]);
    }
  }, [editData?.id]); // <--- Key change here!

  const addItem = () => setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);

  const handleSelectCatalogItem = (index, catalogItemId) => {
  const selectedItem = catalog.find(item => item.id === parseInt(catalogItemId));
  if (!selectedItem) return;

  const updatedItems = [...items];
  updatedItems[index] = {
    ...updatedItems[index],
    description: selectedItem.description,
    quantity: selectedItem.default_quantity,
    unit_price: selectedItem.unit_price
  };
  setItems(updatedItems);
  };

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
  <input type="text" placeholder="Invoice Number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} style={inputStyle}/>
  <input type="text" placeholder="Vendor Name" value={vendorName} onChange={(e) => setVendorName(e.target.value)} style={inputStyle}/>
  <input type="text" inputMode="decimal" placeholder="Amount ($) e.g. 1500.00" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle}/>
  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle}/>
  <input placeholder="PO Number" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} style={inputStyle}/>
  <input placeholder="Vendor Address" value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle}/>
  
  {/* ======================================================== */}
  {/* 👇 PASTE YOUR LINE ITEMS MAP BLOCK RIGHT HERE 👇 */}
  {/* ======================================================== */}

  <h5 style={{ margin: '10px 0 5px 0' }}>Line Items</h5>
  
  {items.map((item, index) => (
    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
      {/* Dropdown for Predefined Items */}
      <select
        style={inputStyle}
        onChange={(e) => handleSelectCatalogItem(index, e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>-- Select Predefined Item --</option>
        {catalog.map((catItem) => (
          <option key={catItem.id} value={catItem.id}>
            {catItem.description} (${catItem.unit_price})
          </option>
        ))}
      </select>

      {/* Input fields auto-populated or manually editable */}
      <input
        type="text"
        placeholder="Description"
        value={item.description}
        onChange={(e) => updateItem(index, 'description', e.target.value)}
        style={inputStyle}
      />
      <input
        type="number"
        placeholder="Qty"
        value={item.quantity}
        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
        style={{ ...inputStyle, width: '80px' }}
      />
      <input
        type="number"
        step="0.01"
        placeholder="Unit Price ($)"
        value={item.unit_price}
        onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
        style={{ ...inputStyle, width: '120px' }}
      />
    </div>
  ))}

  {/* ======================================================== */}

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