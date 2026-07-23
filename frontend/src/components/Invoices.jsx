import React, { useState, useEffect } from 'react';
import { formatCurrency, calculateGrandTotal, formatDate } from '../utils/formatters';

// Isolated Popover Preview Component
// Safe, Isolated Popover Preview Component
function InvoicePopover({ invoice, position }) {
  // Safely extract line items (handles undefined/null without crashing)
  const items = invoice?.items || invoice?.line_items || [];

  return (
    <div
      style={{
        position: 'fixed',
        top: position?.top ? position.top - 10 : 0,
        left: position?.left || 0,
        zIndex: 9999,
        backgroundColor: '#ffffff',
        border: '1px solid #ddd',
        boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
        padding: '12px',
        borderRadius: '6px',
        minWidth: '250px',
        pointerEvents: 'none', // Prevents mouse flicker when hovering over popover
      }}
    >
      <h5 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
        Item Summary ({invoice?.invoice_number})
      </h5>

      {items.length === 0 ? (
        <span style={{ fontSize: '0.8rem', color: '#888' }}>No items recorded</span>
      ) : (
        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem', color: '#444' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>
              <strong>{item.description || 'Item'}</strong> <br />
              <span style={{ color: '#666' }}>
                {item.quantity} × {formatCurrency(item.unit_price, item.currency || 'USD')} = {formatCurrency((item.quantity || 0) * (item.unit_price || 0), item.currency || 'USD')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 1. Status Badge & Editor Component
function StatusBadge({ isEditing, status, editFormData, onStatusChange }) {
  const getStatusStyle = (val) => {
    switch (val) {
      case 'Paid':
        return { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' };
      case 'Pending':
        return { backgroundColor: '#fef9c3', color: '#a16207', border: '1px solid #fde047' };
      case 'Cancelled':
        return { backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
    }
  };

  if (isEditing) {
    return (
      <select
        value={editFormData.status}
        onChange={(e) => onStatusChange(e.target.value)}
        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
      >
        <option value="Pending">Pending</option>
        <option value="Paid">Paid</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    );
  }

  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'inline-block',
        ...getStatusStyle(status),
      }}
    >
      {status}
    </span>
  );
}

// 2. Row Action Buttons Component
function InvoiceActions({ isEditing, onEdit, onSave, onCancel, onDelete }) {
  if (isEditing) {
    return (
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        <button onClick={onSave} style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
          Save
        </button>
        <button onClick={onCancel} style={{ backgroundColor: '#64748b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
      <button onClick={onEdit} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
        Edit
      </button>
      <button onClick={onDelete} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
        Delete
      </button>
    </div>
  );
}

// Line Item Input Row Component (Form Creation / Edit)
function LineItemInputRow({ item, index, onChange, onRemove, canRemove }) {
  // Line 150: Calculate numeric total without .toFixed(2)
  const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);

  return (
    <>
      <input
        type="text"
        placeholder="Item Description"
        value={item.description}
        onChange={(e) => onChange(index, 'description', e.target.value)}
        required
        style={{ flex: 3, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <input
        type="number"
        min="1"
        placeholder="Qty"
        value={item.quantity}
        onChange={(e) => onChange(index, 'quantity', e.target.value)}
        required
        style={{ width: '70px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <input
        type="number"
        step="0.01"
        placeholder="Price ($)"
        value={item.unit_price}
        onChange={(e) => onChange(index, 'unit_price', e.target.value)}
        required
        style={{ width: '90px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      {/* ✅ After (Lines 180-182) */}
      <span style={{ fontWeight: 'bold', width: '80px', textAlign: 'right' }}>
      {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0))}
      </span>
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          style={{ color: '#dc3545', border: 'none', background: 'none', cursor: 'pointer' }}
        >
          ✕
        </button>
      )}
    </>
  );
}

// Table Row Component
function InvoiceRow({
  inv,
  isEditing,
  editFormData,
  setEditFormData,
  handleStartEdit,
  handleSaveEdit,
  setEditingId,
  handleDeleteInvoice,
  }) {
  // Local hover & popover state inside each row
  const [isHovered, setIsHovered] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  return (
    <tr style={{ borderBottom: '1px solid #eee' }}>
      {/* 1. Invoice Number Cell */}
      <td
        style={{ padding: '10px', position: 'relative' }}
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPopoverPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
          setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span style={{ fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
          {inv.invoice_number}
        </span>
        {isHovered && (
          <InvoicePopover invoice={inv} position={popoverPos} />
        )}
      </td>

      {/* 2. Vendor Name Cell */}
      <td style={{ padding: '10px' }}>
        {inv.vendor_name || inv.vendor}
      </td>

      {/* 3. PO Number Cell (Inline Editable) */}
      <td style={{ padding: '10px' }}>
        {isEditing ? (
          <input
            type="text"
            value={editFormData.po_number || ''}
            onChange={(e) => setEditFormData({ ...editFormData, po_number: e.target.value })}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
          />
        ) : (
          inv.po_number || 'N/A'
        )}
      </td>

      {/* 4. Amount ($) */}
      {/* ✅ Updated with formatCurrency */}
      <td style={{ fontWeight: 'bold', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {formatCurrency(inv.total_amount)}
      </td>

      {/* 5. Status Column */}
      <td style={{ padding: '10px', textAlign: 'center' }}>
        <StatusBadge
          isEditing={isEditing}
          status={inv.status}
          editFormData={editFormData}
          onStatusChange={(newStatus) => setEditFormData({ ...editFormData, status: newStatus })}
        />
      </td>

      {/* 6. Action Buttons Column */}
      <td style={{ padding: '10px', textAlign: 'center' }}>
        <InvoiceActions
          isEditing={isEditing}
          onEdit={() => handleStartEdit(inv)}
          onSave={() => handleSaveEdit(inv.id)}
          onCancel={() => setEditingId(null)}
          onDelete={() => handleDeleteInvoice(inv.id, inv.invoice_number)}
        />
      </td>
    </tr>
  );
}

// Place at the bottom of Invoices.jsx
function DataTable({ title, headers, children }) {
  return (
    <div style={{ marginTop: '20px' }}>
      {title && <h3 style={{ textAlign: 'center', color: '#333' }}>{title}</h3>}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '10px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333', backgroundColor: '#f8f9fa' }}>
            {headers.map((header, idx) => (
              <th
                key={idx}
                style={{
                  padding: '10px',
                  textAlign: header.align || 'left',
                  width: header.width || 'auto',
                }}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}

export default function Invoices({ token, baseUrl }) {

  const invoiceHeaders = [
    { label: 'Invoice #' },
    { label: 'Vendor' },
    { label: 'PO #' },
    { label: 'Amount', align: 'right' },
    { label: 'Status', align: 'center' },
    { label: 'Actions', align: 'center' },
  ];

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

          <hr style={{ border: 'none', borderTop: '3px solid #b0b0b0', margin: '20px 0 15px 0', borderRadius: '2px' }} />         
        <div 
          style={{ 
            display: 'flex', 
            gap: '10px', 
            alignItems: 'left', 
            marginBottom: '8px', 
            fontWeight: 'bold', 
            fontSize: '0.85rem', 
            color: '#555' 
          }}
>
          <span style={{ flex: 1, textAlign: 'center' }}>Description</span>
          <span style={{ width: '60px', textAlign: 'left' }}>Qty</span>
          <span style={{ width: '80px', textAlign: 'center' }}>Unit Price</span>
          <span style={{ width: '80px', textAlign: 'right' }}>Total Amt </span>
          </div>
          <hr style={{ border: 'none', borderTop: '3px solid #b0b0b0', margin: '20px 0 15px 0', borderRadius: '2px' }} />         
        
          {lineItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
          <LineItemInputRow
          key={idx}
          item={item}
          index={idx}
          onChange={handleLineItemChange}
          onRemove={removeLineItem}
          canRemove={lineItems.length > 1}/>
            </div>
          ))}

          <button type="button" onClick={addLineItem} style={{ marginBottom: '15px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}>
            + Add Line Item
          </button>

          {/* ==================== 1. GRAND TOTAL DISPLAY ==================== */}
          <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px', marginBottom: '15px' }}>
            Grand Total: <span style={{ color: '#28a745' }}>{formatCurrency(calculateGrandTotal(lineItems))}</span>
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
      <DataTable title="Invoice Records" headers={invoiceHeaders}>
        {invoices.map((inv) => (
          <InvoiceRow
            key={inv.id}
            inv={inv}
            isEditing={editingId === inv.id}
            editFormData={editFormData}
            setEditFormData={setEditFormData}
            handleStartEdit={handleStartEdit}
            handleSaveEdit={handleSaveEdit}
            setEditingId={setEditingId}
            handleDeleteInvoice={handleDeleteInvoice}
          />
        ))}
      </DataTable>
    </div>
  );
}