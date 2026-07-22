import React, { useState, useEffect } from 'react';

export default function Invoices({ token, baseUrl }) {
  const [invoices, setInvoices] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [hoveredInvoiceId, setHoveredInvoiceId] = useState(null);

  // --- Form State ---
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [lineItems, setLineItems] = useState([{ description: '', quantity: 1, unit_price: 0 }]);

  // --- Inline Edit State ---
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    po_number: '',
    status: 'PENDING',
  });

  // Helper to format numbers like 1965000 -> $1,965,000.00
  const formatCurrency = (value) => {
    const amount = parseFloat(value) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

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

  // 2. Pre-fill Line Item when selecting a Catalog Item
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

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + qty * price;
    }, 0).toFixed(2);
  };

  // 3. Create Invoice Handler
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    const payload = {
      invoice_number: invoiceNumber,
      vendor_name: vendorName,
      po_number: poNumber,
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
        setInvoiceNumber('');
        setVendorName('');
        setPoNumber('');
        setSelectedCatalogId('');
        setLineItems([{ description: '', quantity: 1, unit_price: 0 }]);
        fetchData();
      } else {
        alert('Failed to save invoice. Check entries.');
      }
    } catch (err) {
      console.error('Error saving invoice:', err);
    }
  };

  // 4. Inline Edit Handlers
  const handleStartEdit = (inv) => {
    setEditingId(inv.id);
    setEditFormData({
      po_number: inv.po_number || '',
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

  // 5. Delete Invoice Handler
  const handleDeleteInvoice = async (id, invoiceNum) => {
    const confirmed = window.confirm(`Are you sure you want to delete Invoice "${invoiceNum}"?`);
    if (!confirmed) return;
    try {
      const response = await fetch(`${baseUrl}/invoices/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok || response.status === 204) {
        // Optimistically remove from state
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      } else {
        alert('Failed to delete invoice record from server.');
      }
    } catch (err) {
      console.error('Error deleting invoice:', err);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* ==================== CREATE INVOICE FORM ==================== */}
      <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fafafa', marginBottom: '30px' }}>
        <h3 style={{ textAlign: 'center', marginTop: 0, color: '#333' }}>📄 Create New Invoice</h3>

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
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Invoice Number *</label>
              <input
                type="text"
                placeholder="INV-1001"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Vendor Name *</label>
              <input
                type="text"
                placeholder="Vendor Pte Ltd"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>PO Number (Optional)</label>
              <input
                type="text"
                placeholder="PO-9901"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          <h4 style={{ marginBottom: '8px' }}>Line Items</h4>
          {lineItems.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Item Description"
                value={item.description}
                onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                required
                style={{ flex: 3, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                required
                style={{ width: '70px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price ($)"
                value={item.unit_price}
                onChange={(e) => handleLineItemChange(idx, 'unit_price', e.target.value)}
                required
                style={{ width: '90px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <span style={{ fontWeight: 'bold', width: '80px', textAlign: 'right' }}>
                ${((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)).toFixed(2)}
              </span>
              {lineItems.length > 1 && (
                <button type="button" onClick={() => removeLineItem(idx)} style={{ color: '#dc3545', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                  ✕
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addLineItem} style={{ marginBottom: '15px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}>
            + Add Line Item
          </button>

          {/* ==================== 1. GRAND TOTAL DISPLAY ==================== */}
          <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px', marginBottom: '15px' }}>
            Grand Total: <span style={{ color: '#28a745' }}>{formatCurrency(calculateTotal())}</span>
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
      <h3 style={{ textAlign: 'center', color: '#333' }}>Invoice History</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '10px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333', backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Invoice #</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Vendor</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>PO #</th>
            {/* Right-align numeric columns for professional table layout */}
            <th style={{ padding: '10px', textAlign: 'center' }}>Amount</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const isEditing = editingId === inv.id;
            const isHovered = hoveredInvoiceId === inv.id;
      
            // --- Itemized Calculations ---
            const items = inv.items || [];
            const itemCount = items.length;
            const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
            
            const itemsSum = items.reduce(
              (sum, i) => sum + (Number(i.quantity || 0) * Number(i.unit_price || 0)), 
              0
            );
            const displayAmount = inv.total_amount ?? itemsSum ?? 0;

            return (
              <tr key={inv.id} style={{ borderBottom: '1px solid #eee' }}>
                {/* Combined Hover Zone & Inline Editing for Invoice #, Vendor, and PO # */}
            <td 
              colSpan={3} 
              style={{ padding: 0, position: 'relative' }}
              onMouseEnter={() => setHoveredInvoiceId(inv.id)}
              onMouseLeave={() => setHoveredInvoiceId(null)}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', padding: '10px', cursor: 'pointer', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#0056b3', textDecoration: 'underline' }}>
                  {inv.invoice_number}
                </span>
                <span>{inv.vendor_name}</span>
                <span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.po_number}
                      onChange={(e) => setEditFormData({ ...editFormData, po_number: e.target.value })}
                      style={{ width: '90%', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  ) : (
                    inv.po_number || '-'
                  )}
                </span>
              </div>

              {/* Hover Preview Popover Card */}
              {isHovered && !isEditing && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '10px',
                    zIndex: 999,
                    width: '380px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    padding: '14px',
                    pointerEvents: 'none',
                    fontFamily: 'sans-serif',
                  }}
                >
                  {/* Popover Header */}
                  <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e293b' }}>
                      📋 Line Items Breakdown ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                    </span>
                    <span style={{ fontSize: '11px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                      Total Qty: {totalQuantity}
                    </span>
                  </div>

                  {/* Popover Table of Items */}
                  {items.length > 0 ? (
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ color: '#64748b', borderBottom: '1px solid #f1f5f9', textAlign: 'left' }}>
                          <th style={{ paddingBottom: '4px' }}>Item Description</th>
                          <th style={{ paddingBottom: '4px', textAlign: 'center' }}>Qty</th>
                          <th style={{ paddingBottom: '4px', textAlign: 'right' }}>Unit Price</th>
                          <th style={{ paddingBottom: '4px', textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => {
                          const lineTotal = (Number(item.quantity || 0) * Number(item.unit_price || 0));
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                              <td style={{ padding: '6px 0', color: '#334155' }}>{item.description || 'Unassigned Item'}</td>
                              <td style={{ padding: '6px 0', textAlign: 'center', color: '#475569' }}>{item.quantity}</td>
                              <td style={{ padding: '6px 0', textAlign: 'right', color: '#475569' }}>{formatCurrency(item.unit_price)}</td>
                              <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(lineTotal)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '8px 0' }}>
                      No itemized records available for this invoice.
                    </div>
                  )}

                  {/* Popover Footer Summary */}
                  <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '10px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                    <span style={{ color: '#475569' }}>Invoice Total:</span>
                    <span style={{ color: '#16a34a' }}>{formatCurrency(displayAmount)}</span>
                  </div>
                </div>
              )}
            </td>

                {/* Amount ($) */}
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', fontVariantNumeric: 'tabular-nums', }}>
                  {formatCurrency(displayAmount)}
                </td>

                {/* Status & Actions... */}
                <td style={{ padding: '10px', textAlign: 'center'}}>
                  {isEditing ? (
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  ) : (
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        letterSpacing: '0.5px',
                        backgroundColor: inv.status === 'PAID' ? '#d4edda' : inv.status === 'CANCELLED' ? '#f8d7da' : '#fff3cd',
                        color: inv.status === 'PAID' ? '#155724' : inv.status === 'CANCELLED' ? '#721c24' : '#856404',
                      }}
                    >
                      {inv.status}
                    </span>
                  )}
                </td>

                {/* Action Buttons */}
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => handleSaveEdit(inv.id)} style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => handleStartEdit(inv)} style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteInvoice(inv.id, inv.invoice_number)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
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