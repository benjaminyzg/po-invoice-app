import React, { useState, useEffect } from 'react';
  
export default function PurchaseOrders({ token, baseUrl }) {
  // Multi-line items state
  const [items, setItems] = useState([{ description: '', qty: 1, unitPrice: '', currency: 'SGD' }]);
  const [pos, setPos] = useState([]);
  const [formData, setFormData] = useState({po_number: '', vendor_name: '', total_amount: '', status: 'PENDING'});
  const [error, setError] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [vendor, setVendor] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [qty, setQty] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [currency, setCurrency] = useState('SGD');
  const [status, setStatus] = useState('PENDING');
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPoToEdit, setSelectedPoToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPoId, setEditingPoId] = useState(null);
  
  // Handler function for updating a item row field:
  const handleItemChange = (index, field, value) => {
  setItems((prevItems) => {
    const updated = [...prevItems];
    updated[index] = { ...updated[index], [field]: value };
    return updated;
  });
  };
  // Helper: Add a new line item
  const handleAddItem = () => {
    setItems([...items, { description: '', qty: 1, unitPrice: '', currency: 'SGD' }]);
  };
  // Helper: Remove a line item
  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };
  
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  const payload = {
    po_number: poNumber,
    vendor_name: vendor,
    status: status,
    items: items,
    total_amount: totalAmount
  };

  try {
    const url = editingPoId 
      ? `${baseUrl}/purchase-orders/${editingPoId}` 
      : `${baseUrl}/purchase-orders`;

    const method = editingPoId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Failed to save Purchase Order');

    // Reset form & edit state
    handleResetForm();
    fetchPOs(); // Refresh table data
  } catch (err) {
    setError(err.message);
  }
};
  
  const handleStatusChange = async (poId, newStatus) => { 
    // Point 1: Check if click handler was triggered and inspect arguments
    console.log(`[PO Track 1] handleStatusChange called | PO ID: ${poId} | Target Status: "${newStatus}"`);
    try {
      // Point 2: Confirm request setup before dispatching
      console.log(`[PO Track 2] Dispatching PATCH request to /api/purchase-orders/${poId}/...`);

      const response = await fetch(`http://localhost:8000/api/purchase-orders/${poId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      // Point 3: Log HTTP Status Code
      console.log(`[PO Track 3] API Response received | Status Code: ${response.status}`);

      const data = await response.json();

      if (response.ok) {
        // Point 4: Success path confirmation
        console.log('[PO Track 4 SUCCESS] Update successful:', data);
        await fetchPurchaseOrders(); // Re-fetch to update UI
      } else {
        // Point 4: Error path confirmation
        console.error('[PO Track 4 ERROR] Backend validation failed:', data);
      }
    } catch (err) {
      console.error('[PO Track EXCEPTION] Request threw error:', err);
    }
  };
  
  const fetchPOs = async () => {
    try {
      // const res = await fetch('/api/purchase-orders/');
      // const data = await res.json();
      // Ensure you pass the array directly:
      // setPurchaseOrders(Array.isArray(data) ? data : data.results || []);

      const res = await fetch(`${baseUrl}/purchase-orders/`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch purchase orders.');
      const data = await res.json();
      
      //setPos(data);

      setPos(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    }
  };
  
  useEffect(() => {
    fetchPOs();
  }, []);

  // Helper: Calculate totals grouped by currency
  const totalsByCurrency = items.reduce((acc, item) => {
    const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);
    const curr = item.currency || 'SGD';
    acc[curr] = (acc[curr] || 0) + lineTotal;
    return acc;
  }, {});
  // Auto-calculate total amount based on quantity and unit price
  const totalAmount = (parseFloat(qty) || 0) * (parseFloat(unitPrice) || 0);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Token ${token}`
  });
    
  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleResetForm = () => {
  setEditingPoId(null);
  setSelectedPoToEdit(null);
  setPoNumber('');
  setVendor('');
  setStatus('PENDING');
  setItems([{ description: '', qty: 1, unitPrice: '', currency: 'SGD' }]);
  };

  console.log("Current pos state:", pos);

  return (
    <div style={{ padding: '10px 0' }}>
      <h3 style={{ textAlign: 'center' }}>📦 Purchase Orders (PO)</h3>
      {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}

      <form 
        onSubmit={handleSubmit} 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px', 
          maxWidth: '750px', 
          margin: '0 auto 30px auto', 
          textAlign: 'left' 
        }}
      >
      <h4 style={{ textAlign: 'center', margin: '0 0 5px 0', fontSize: '18px', fontWeight: '500' }}>
        Create New PO
      </h4>

      {/* 1. Header Details */}
      <PoHeaderDetails 
        poNumber={poNumber} 
        setPoNumber={setPoNumber} 
        vendor={vendor} 
        setVendor={setVendor} 
        status={status} 
        setStatus={setStatus} 
      />

      <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '5px 0' }} />

      {/* 2. Dynamic Line Items */}
      <PoLineItems 
        items={items} 
        handleItemChange={handleItemChange} 
        handleAddItem={handleAddItem} 
        handleRemoveItem={handleRemoveItem} 
      />

      {/* 3. Summary Block */}
      <PoSummary totalsByCurrency={totalsByCurrency}/>

      {/* Submit Button */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button 
          type="submit"
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: editingPoId ? '#28a745' : '#0d6efd', // Green for update, blue for create
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {editingPoId ? 'Update Purchase Order' : 'Create Purchase Order'}
        </button>

        {editingPoId && (
          <button 
            type="button" 
            onClick={handleResetForm} 
            style={{ 
              padding: '12px 20px', 
              backgroundColor: '#6c757d', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: 'bold', 
              fontSize: '15px', 
              cursor: 'pointer' 
            }}
          >
            Cancel Edit
          </button>
        )}
      </div>
      </form>

      {/* 4. PO Table */}
      <PoTable
        purchaseOrders={pos}
        handleStatusChange={handleStatusChange || (() => {})}
        handleEdit={(po) => {
          setEditingPoId(po.id);
          setSelectedPoToEdit(po);

          // Populate top-level fields
          setPoNumber(po.po_number || '');
          setVendor(po.vendor_name || '');
          setStatus(po.status || 'PENDING');

          // Populate line items (if attached to the PO object)
          // if (po.items && po.items.length > 0) {
          //  setItems(po.items.map(item => ({
          //    description: item.description || '',
          //    qty: item.qty || item.quantity || 1,
          //    unitPrice: item.unit_price || item.unitPrice || '',
          //    currency: item.currency || 'SGD'
          //  })));
          // }
          if (po.items && Array.isArray(po.items) && po.items.length > 0) {
            setItems(
              po.items.map((item) => ({
                description: item.description || '',
                qty: item.qty || item.quantity || 1,
                unitPrice: item.unit_price || item.unitPrice || '',
                currency: item.currency || 'SGD'
              }))
            );
          } else {
            setItems([{ description: '', qty: 1, unitPrice: '', currency: 'SGD' }]);
          }

          // Scroll up to form
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        handleCancel={(po) => {
          if (window.confirm(`Are you sure you want to cancel PO ${po.po_number}?`)) {
            handleStatusChange(po.id, 'CANCELLED');
          }
        }}
      />
    </div>
  )
}

  /* 1. Header Details */
  function PoHeaderDetails({ poNumber, setPoNumber, vendor, setVendor, status, setStatus }) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px', textAlign: 'center' }}>
            PO Number
          </label>
          {/* PO Number Input */}
          <input
            type="text"
            placeholder="e.g. PO-2026-001"
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px', textAlign: 'center' }}>
            Vendor Name
          </label>
          {/* Vendor Name Input */}
          <input
            type="text"
            placeholder="Vendor Name"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px', textAlign: 'center' }}>
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', backgroundColor: '#fff', boxSizing: 'border-box' }}
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Fulfilled</option>
            <option value="RECEIVED">Received</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>
    );
  }
  /* 2. Dynamic Line Items */
  function PoLineItems({ items, handleItemChange, handleAddItem, handleRemoveItem }) {
    return (
      <div>
        {/* Section Header */}
        <label 
          style={{ 
            fontWeight: 'bold', 
            fontSize: '14px', 
            color: '#333', 
            display: 'block', 
            marginBottom: '8px', 
            textAlign: 'center' 
          }}
        >
          Enter Purchase Order Record
        </label>

        {/* Horizontal Divider Line */}
        <hr 
          style={{ 
            border: '0', 
            borderTop: '1px solid #e2e8f0', 
            margin: '0 0 12px 0' 
          }} 
        />

        {/* Column Headers */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '3.5fr 0.8fr 1.2fr 0.9fr 1.3fr 32px', 
            gap: '8px', 
            marginBottom: '6px',
            padding: '0 2px'
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#444', textAlign: 'center' }}>Description</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#444', textAlign: 'center' }}>Qty</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#444', textAlign: 'center' }}>Unit Price ($)</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#444', textAlign: 'center' }}>Cur ($)</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#444', textAlign: 'center' }}>Total Amt ($)</span>
          <span></span>
        </div>

        {/* Item Rows */}
        {items.map((item, index) => {
          const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);

          return (
            <div 
              key={index} 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '3.5fr 0.8fr 1.2fr 0.9fr 1.3fr 32px', 
                gap: '8px', 
                alignItems: 'center', 
                marginBottom: '10px' 
              }}
            >
              <input
                type="text"
                placeholder="Item Description"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }}
              />

              <input
                type="number"
                min="1"
                placeholder="1"
                value={item.qty}
                onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', textAlign: 'center' }}
              />

              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={item.unitPrice}
                onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }}
              />

              <select
                value={item.currency}
                onChange={(e) => handleItemChange(index, 'currency', e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' }}
              >
                <option value="SGD">SGD</option>
                <option value="USD">USD</option>
                <option value="MYR">MYR</option>
                <option value="JPY">JPY</option>
              </select>

              <div style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                backgroundColor: '#f8f9fa', 
                border: '1px solid #e0e0e0', 
                fontSize: '13px', 
                fontWeight: '600', 
                textAlign: 'right',
                whiteSpace: 'nowrap'
              }}>
                {item.currency} ${lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                disabled={items.length === 1}
                style={{
                  width: '32px',
                  height: '35px',
                  backgroundColor: items.length === 1 ? '#e0e0e0' : '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: items.length === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={handleAddItem}
          style={{
            marginTop: '4px',
            padding: '6px 12px',
            backgroundColor: '#6c757d',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          + Add Item
        </button>
      </div>
    );
  }
  /* 3. Summary Block (Currency Breakdown) */
  function PoSummary({ totalsByCurrency }) {
    return (
      <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '6px', marginTop: '5px' }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#475569' }}>
          Total Summary:
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {Object.entries(totalsByCurrency).map(([curr, total]) => (
            <span key={curr} style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
              {curr}: ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          ))}
        </div>
      </div>
    );
  }
  /* 4. PO List */
  function PoTable_1({ purchaseOrders, editingPoId, handleStatusChange, handleEdit, handleCancel }) {
    // Track expanded row IDs
    const [expandedPoIds, setExpandedPoIds] = useState([]);

    const toggleExpand = (id) => {
      setExpandedPoIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    };
  return (
    <div>
      <h4 style={{ textAlign: 'center', margin: '20px 0 10px 0' }}>Purchase Order History</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <th></th>
          <th style={{ textAlign: 'left' }}>PO Number</th>
            {/* 1. Center the Vendor header */}
            <th style={{ textAlign: 'center' }}>Vendor</th>
            <th style={{ textAlign: 'right' }}>Amount ($)</th>
            {/* 2. Center Status and Actions headers */}
            <th style={{ textAlign: 'center' }}>Status</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
        </thead>
        <tbody>
          {purchaseOrders && purchaseOrders.map((po) => {
            const isExpanded = expandedPoIds.includes(po.id);
            return (
              <React.Fragment key={po.id || po.po_number}>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  {/* Expand Toggle Button */}
                  <td style={{ textAlign: 'center', width: '30px' }}>
                    <button
                      type="button"
                      onClick={() => toggleExpand(po.id)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {isExpanded ? '▼' : '►'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'left', padding: '8px' }}>{po.po_number}</td>
                  <td style={{ textAlign: 'left', padding: '8px' }}>{po.vendor_name}</td>
                  <td style={{ textAlign: 'right', padding: '8px' }}>
                    ${Number(po.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{po.status}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <button onClick={() => handleEdit(po)}> Edit </button>

                    <button onClick={() => handleCancel(po)} disabled={po.status === 'CANCELLED'}>
                      Cancel
                    </button>
                  </td>
                </tr>
                {/* Expanded Item Details Sub-Table */}
                {isExpanded && (
                  <tr>
                    <td colSpan="6" style={{ backgroundColor: '#fdfdfd', padding: '10px 20px' }}>
                      <strong>Line Items:</strong>
                      {po.items && po.items.length > 0 ? (
                        <table style={{ width: '100%', marginTop: '5px', fontSize: '13px', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #ccc', color: '#555' }}>
                              <th style={{ textAlign: 'left' }}>Description</th>
                              <th style={{ textAlign: 'center' }}>Qty</th>
                              <th style={{ textAlign: 'right' }}>Unit Price ($)</th>
                              <th style={{ textAlign: 'right' }}>Total ($)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {po.items.map((item, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td>{item.description}</td>
                                <td style={{ textAlign: 'center' }}>{item.qty || item.quantity}</td>
                                <td style={{ textAlign: 'right' }}>${Number(item.unit_price || item.unitPrice || 0).toFixed(2)}</td>
                                <td style={{ textAlign: 'right' }}>
                                  ${(Number(item.qty || item.quantity || 1) * Number(item.unit_price || item.unitPrice || 0)).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ margin: '5px 0', color: '#777', fontSize: '13px' }}>No line items recorded for this PO.</p>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
  }
  /* 4. PO List - Working Version */
  function PoTable({ purchaseOrders, handleStatusChange, handleEdit, handleCancel }) {
  const [expandedPoIds, setExpandedPoIds] = useState([]);

  const toggleExpand = (id) => {
    setExpandedPoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <h4 style={{ textAlign: 'center', margin: '20px 0 15px 0', color: '#333' }}>
        Purchase Order History
      </h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
            <th style={{ width: '30px', padding: '10px 4px' }}></th>
            <th style={{ textAlign: 'left', padding: '10px' }}>PO Number</th>
            <th style={{ textAlign: 'center', padding: '10px' }}>Vendor</th>
            <th style={{ textAlign: 'right', padding: '10px' }}>Amount ($)</th>
            <th style={{ textAlign: 'center', padding: '10px' }}>Status</th>
            <th style={{ textAlign: 'center', padding: '10px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchaseOrders && purchaseOrders.map((po) => {
            const isExpanded = expandedPoIds.includes(po.id);
            return (
              <React.Fragment key={po.id || po.po_number}>
                {/* Main PO Row */}
                <tr style={{ borderBottom: '1px solid #f1f3f5', transition: 'background-color 0.15s' }}>
                  <td style={{ textAlign: 'center', padding: '10px 4px' }}>
                    <button
                      type="button"
                      onClick={() => toggleExpand(po.id)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#6c757d',
                        padding: '2px 4px'
                      }}
                    >
                      {isExpanded ? '▼' : '►'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'left', padding: '10px', fontWeight: '500' }}>
                    {po.po_number}
                  </td>
                  <td style={{ textAlign: 'left', padding: '10px' }}>
                    {po.vendor_name}
                  </td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>
                    ${Number(po.total_amount || 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: po.status === 'CANCELLED' ? '#f8d7da' : '#d1e7dd',
                      color: po.status === 'CANCELLED' ? '#842029' : '#0f5132'
                    }}>
                      {po.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleEdit(po)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #ced4da',
                          borderRadius: '4px'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancel && handleCancel(po)}
                        disabled={po.status === 'CANCELLED'}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: po.status === 'CANCELLED' ? 'not-allowed' : 'pointer',
                          backgroundColor: po.status === 'CANCELLED' ? '#e9ecef' : '#dc3545',
                          color: po.status === 'CANCELLED' ? '#adb5bd' : '#ffffff',
                          border: 'none',
                          borderRadius: '4px'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Integrated Itemized Preview Sub-Table */}
                {isExpanded && (
                  <tr>
                    <td colSpan="6" style={{ backgroundColor: '#fdfdfd', padding: '12px 24px', borderBottom: '1px solid #e9ecef' }}>
                      <div style={{ fontSize: '13px' }}>
                        <span style={{ fontWeight: '600', color: '#495057' }}>Line Items Detail</span>
                        {po.items && po.items.length > 0 ? (
                          <table style={{ width: '100%', marginTop: '8px', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid #dee2e6', color: '#6c757d' }}>
                                <th style={{ textAlign: 'left', padding: '6px' }}>Description</th>
                                <th style={{ textAlign: 'center', padding: '6px', width: '60px' }}>Qty</th>
                                <th style={{ textAlign: 'right', padding: '6px', width: '100px' }}>Unit Price ($)</th>
                                <th style={{ textAlign: 'right', padding: '6px', width: '100px' }}>Total ($)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {po.items.map((item, idx) => {
                                const qty = Number(item.qty || item.quantity || 1);
                                const price = Number(item.unit_price || item.unitPrice || 0);
                                return (
                                  <tr key={idx} style={{ borderBottom: '1px solid #f1f3f5' }}>
                                    <td style={{ padding: '6px', textAlign: 'left' }}>{item.description}</td>
                                    <td style={{ padding: '6px', textAlign: 'center' }}>{qty}</td>
                                    <td style={{ padding: '6px', textAlign: 'right' }}>${price.toFixed(2)}</td>
                                    <td style={{ padding: '6px', textAlign: 'right' }}>${(qty * price).toFixed(2)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        ) : (
                          <p style={{ margin: '6px 0 0 0', color: '#868e96', fontStyle: 'italic', fontSize: '12px' }}>
                            No line items recorded for this PO.
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
