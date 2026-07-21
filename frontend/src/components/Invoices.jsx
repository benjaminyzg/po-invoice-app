import React, { useState, useEffect } from 'react';

export default function Invoices({ token, baseUrl }) {
  const [invoices, setInvoices] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);

  // --- Form State ---
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [lineItems, setLineItems] = useState([
    { description: '', quantity: 1, unit_price: 0 }
  ]);

  // --- Inline Edit State ---
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    po_number: '',
    amount: '',
    status: 'PENDING',
  });

  // 1. Fetch Invoices and Predefined Catalog Items
  const fetchData = async () => {
    try {
      const headers = { Authorization: `Token ${token}` };
      const [invRes, catRes] = await Promise.all([
        fetch(`${baseUrl}/invoices/`, { headers }),
        fetch(`${baseUrl}/catalog-items/`, { headers }),
      ]);

      if (invRes.ok) setInvoices(await invRes.json());
      if (catRes.ok) setCatalogItems(await catRes.json());
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Pre-fill Line Item when selecting a Predefined Catalog Item
  const handleSelectCatalogItem = (e) => {
    const catId = e.target.value;
    setSelectedCatalogId(catId);

    if (!catId) return;

    const item = catalogItems.find((c) => String(c.id) === String(catId));
    if (item) {
      setLineItems([
        {
          description: item.name || item.description || '',
          quantity: 1,
          unit_price: item.price || item.unit_price || 0,
        }
      ]);
    }
  };

  // Dynamic Line Item updates
  const handleLineItemChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  // Calculate Subtotal & Grand Total dynamically
  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + qty * price;
    }, 0).toFixed(2);
  };

  // 3. Save New Invoice to Django Backend
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    const grandTotal = calculateTotal();

    const payload = {
      invoice_number: invoiceNumber,
      vendor_name: vendorName,
      po_number: poNumber,
      total_amount: grandTotal,
      amount: grandTotal,
      items: lineItems.map((item) => ({
        description: item.description,
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price) || 0,
      })),
    };

    try {
      const response = await fetch(`${baseUrl}/invoices/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Reset form inputs & reload history
        setInvoiceNumber('');
        setVendorName('');
        setPoNumber('');
        setSelectedCatalogId('');
        setLineItems([{ description: '', quantity: 1, unit_price: 0 }]);
        fetchData();
      } else {
        alert('Failed to save invoice. Please check your entries.');
      }
    } catch (err) {
      console.error('Error saving invoice:', err);
    }
  };

  // 4. Inline Edit Mode Handlers
  const handleStartEdit = (inv) => {
    setEditingId(inv.id);
    // Fallback check to ensure amount is always a valid value
    const currentAmount = inv.total_amount ?? inv.amount ?? '0.00';
    setEditFormData({
      po_number: inv.po_number || '',
      amount: currentAmount,
      status: inv.status || 'PENDING',
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/invoices/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          po_number: editFormData.po_number,
          total_amount: editFormData.amount,
          amount: editFormData.amount,
          status: editFormData.status,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setInvoices(invoices.map((inv) => (inv.id === id ? updated : inv)));
        setEditingId(null);
      } else {
        alert('Failed to update invoice.');
      }
    } catch (err) {
      console.error('Error updating invoice:', err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* ==================== CREATE INVOICE FORM ==================== */}
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fdfdfd', marginBottom: '30px' }}>
        <h3 style={{ textAlign: 'center', marginTop: 0 }}>📄 Create New Invoice</h3>

        {/* Predefined Item Quick Selector */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Quick Select Catalog Item:</label>
          <select
            value={selectedCatalogId}
            onChange={handleSelectCatalogItem}
            style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">-- Select Predefined Catalog Item --</option>
            {catalogItems.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name || cat.description} (${cat.price || cat.unit_price})
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleCreateInvoice}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontSize: '12px' }}>Invoice Number *</label>
              <input
                type="text"
                placeholder="INV-1001"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px' }}>Vendor Name *</label>
              <input
                type="text"
                placeholder="Vendor Pte Ltd"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px' }}>PO Number (Optional)</label>
              <input
                type="text"
                placeholder="PO-9901"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Line Items Table */}
          <h4 style={{ marginBottom: '8px' }}>Line Items</h4>
          {lineItems.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Item Description"
                value={item.description}
                onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                required
                style={{ flex: 3, padding: '8px' }}
              />
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                required
                style={{ width: '70px', padding: '8px' }}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price ($)"
                value={item.unit_price}
                onChange={(e) => handleLineItemChange(idx, 'unit_price', e.target.value)}
                required
                style={{ width: '90px', padding: '8px' }}
              />
              <span style={{ fontWeight: 'bold', width: '80px' }}>
                ${((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)).toFixed(2)}
              </span>
              {lineItems.length > 1 && (
                <button type="button" onClick={() => removeLineItem(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                  ✕
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addLineItem} style={{ marginBottom: '15px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
            + Add Line Item
          </button>

          <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px', marginBottom: '15px' }}>
            Grand Total: <span style={{ color: '#28a745' }}>${calculateTotal()}</span>
          </div>

          <button
            type="submit"
            style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Save Invoice
          </button>
        </form>
      </div>

      {/* ==================== INVOICE HISTORY TABLE ==================== */}
      <h3 style={{ textAlign: 'center' }}>Invoice History</h3>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333' }}>
            <th style={{ padding: '8px' }}>Invoice #</th>
            <th style={{ padding: '8px' }}>Vendor</th>
            <th style={{ padding: '8px' }}>PO #</th>
            <th style={{ padding: '8px' }}>Amount ($)</th>
            <th style={{ padding: '8px' }}>Status</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const isEditing = editingId === inv.id;
            // Key fix for `$ undefined`: checks total_amount first, then amount, then defaults to 0.00
            const displayAmount = inv.total_amount ?? inv.amount ?? '0.00';

            return (
              <tr key={inv.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>{inv.invoice_number}</td>
                <td style={{ padding: '8px' }}>{inv.vendor_name}</td>

                {/* Editable PO # */}
                <td style={{ padding: '8px' }}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.po_number}
                      onChange={(e) => setEditFormData({ ...editFormData, po_number: e.target.value })}
                      style={{ width: '90%', padding: '4px' }}
                    />
                  ) : (
                    inv.po_number || '-'
                  )}
                </td>

                {/* Editable Amount ($) */}
                <td style={{ padding: '8px', fontWeight: 'bold' }}>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.amount}
                      onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                      style={{ width: '80px', padding: '4px' }}
                    />
                  ) : (
                    `$ ${displayAmount}`
                  )}
                </td>

                {/* Editable Status */}
                <td style={{ padding: '8px' }}>
                  {isEditing ? (
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      style={{ padding: '4px' }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  ) : (
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: inv.status === 'PAID' ? '#d4edda' : inv.status === 'CANCELLED' ? '#f8d7da' : '#fff3cd',
                        color: inv.status === 'PAID' ? '#155724' : inv.status === 'CANCELLED' ? '#721c24' : '#856404',
                      }}
                    >
                      {inv.status}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td style={{ padding: '8px', textAlign: 'center' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleSaveEdit(inv.id)}
                        style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(inv)}
                      style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}