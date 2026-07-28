import React, { useState } from 'react';

const inputStyle = {
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '14px'
};

export default function AddInvoiceForm({ catalog = [], onSaveInvoice }) {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [address, setAddress] = useState('');
  
  const [items, setItems] = useState([
    { description: '', quantity: 1, unit_price: 0 }
  ]);

  // Line Item Handlers
  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSelectCatalogItem = (index, catItemId) => {
    const selected = catalog.find((c) => String(c.id) === String(catItemId));
    if (selected) {
      const updated = [...items];
      updated[index] = {
        ...updated[index],
        description: selected.description,
        unit_price: selected.unit_price
      };
      setItems(updated);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveInvoice({
      invoiceNumber,
      vendorName,
      dueDate,
      poNumber,
      address,
      items
    });
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
      <h4>Add New Invoice</h4>
      <form onSubmit={handleSubmit}>
        {/* Invoice Header Fields */}
        <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
          <input placeholder="Invoice Number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} style={inputStyle} />
          <input placeholder="Vendor Name" value={vendorName} onChange={(e) => setVendorName(e.target.value)} style={inputStyle} />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
          <input placeholder="PO Number" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} style={inputStyle} />
          <input placeholder="Vendor Address" value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} />
        </div>

        <h5 style={{ margin: '10px 0 10px 0' }}>Line Items</h5>

        {/* Dynamic Line Item Rows */}
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            {/* Catalog Dropdown */}
            <select
              style={{ ...inputStyle, flex: 1 }}
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

            {/* Description */}
            <input
              type="text"
              placeholder="Item Description"    /*Sub-Header: Description*/
              value={item.description}
              onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
              style={{ ...inputStyle, flex: 1}}
            />

            {/* Quantity */}
            <input
              type="number"
              placeholder="Qty"                /*Sub-Header: Qty */
              value={item.quantity}
              onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
              style={{ ...inputStyle, width: '70px', flex: '1 1 350px'}}
            />

            {/* Unit Price */}
            <input
              type="number"
              step="0.01"
              placeholder="Testing 1234"           /*Sub-Header: Unit Price  */
              value={item.unit_price}
              onChange={(e) => handleUpdateItem(index, 'unit_price', e.target.value)}
              style={{ ...inputStyle, width: '100px', textAlign: 'left'}}
            />

            {/* Calculated Total Display */}
            <div style={{ width: '80px', textAlign: 'left', fontWeight: 'bold', textAlign: 'left' }}>
              ${((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)}
            </div>

            {/* Delete Button (Always rendered in DOM, hidden when 1 item remains) */}
            {/* Spacer matching the 30px Delete Button (lines 135) */}
            <div style={{ width: '30px' }} />
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              disabled={items.length === 1}
              style={{
                visibility: items.length > 1 ? 'visible' : 'hidden',
                width: '30px',
                minWidth: '30px',
                border: 'none',
                background: 'transparent',
                color: '#d9534f',
                cursor: items.length > 1 ? 'pointer' : 'default',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          </div>
        ))}

        <button type="button" onClick={handleAddItem} style={{ marginTop: '10px', marginBottom: '20px' }}>
          + Add Line Item
        </button>

        <div>
          <button type="submit" style={{ backgroundColor: '#28a745', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Save Invoice
          </button>
        </div>
      </form>
    </div>
  );
}