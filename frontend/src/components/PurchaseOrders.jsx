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
  setError('');

  // 1. Filter out empty/unfilled line items
  const validItems = items.filter(
      (item) => item.description && item.description.trim() !== '' && Number(item.unitPrice) > 0
    );

    if (validItems.length === 0) {
      setError('Please provide at least one valid line item with a description and unit price.');
      return;
    }

    // 2. Calculate total amount
  const grandTotal = validItems.reduce(
      (sum, item) => sum + (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0),
      0
  );

    // 3. Format payload in snake_case expected by Django REST Framework
  const payload = {
      po_number: poNumber,
      vendor_name: vendor,
      status: status, // Matches choice field (e.g. 'Pending', 'Fulfilled')
      total_amount: grandTotal,
      items: validItems.map((item) => ({
        description: item.description,
        quantity: Number(item.qty),
        unit_price: parseFloat(item.unitPrice),
        currency: item.currency || 'SGD',
      })),
    };

    try {
      const response = await fetch(`${baseUrl}/purchase-orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok || response.status === 201) {
      console.log('Purchase Order Created Successfully!');
      // Reset form state
      setPoNumber('');
      setVendor('');
      setStatus('PENDING');
      setItems([{ description: '', qty: 1, unitPrice: '', currency: 'SGD' }]);
      
      // Refresh the PO table list
      await fetchPOs();
    } else {
      // Safely check content type to prevent SyntaxError on HTML error responses
      const contentType = response.headers.get('content-type');
      let errorMessage = '';

      if (contentType && contentType.includes('application/json')) {
        const errData = await response.json();
        console.error('Django REST Framework Errors:', errData);
        errorMessage = JSON.stringify(errData);
      } else {
        const textData = await response.text();
        console.error(`Backend returned non-JSON response (${response.status}):`, textData);
        errorMessage = `HTTP ${response.status}: Route not found or Server Error`;
      }

      setError(`Failed to create PO: ${errorMessage}`);
    }
    } catch (err) {
      console.error('Network Error during PO creation:', err);
      setError('Network error occurred while connecting to backend.');
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
      <button
        type="submit"
        style={{
          padding: '12px',
          backgroundColor: '#2b7fff',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '15px',
          cursor: 'pointer',
          marginTop: '5px'
        }}
      >
        Create Purchase Order
      </button>
      </form>

      {/* 4. PO Table */}
      <PoTable 
        purchaseOrders={pos} 
        handleStatusChange={handleStatusChange || (() => {})} 
        handleEdit={() => {}} 
      />
    </div>
  );
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
  function PoTable({ purchaseOrders, handleStatusChange, handleEdit }) {
    return (
      <div>
        <h4 style={{ textAlign: 'center', margin: '20px 0 10px 0' }}>Purchase Order History</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '10px 8px' }}>PO Number</th>
              <th style={{ padding: '10px 8px', textAlign: 'center'}}>Vendor</th>
              <th style={{ padding: '10px 8px', textAlign: 'right' }}>Amount ($)</th>
              <th style={{ padding: '10px 8px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '10px 8px', textAlign: 'center' }}>Actions</th>
            </tr> 
          </thead>
          <tbody>
            {purchaseOrders.map((po) => (
              <tr key={po.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                <td style={{ padding: '10px 8px' }}>{po.po_number || po.poNumber || 'N/A'}</td>
                <td style={{ padding: '10px 8px' }}>{po.vendor_name || po.vendor || 'N/A'}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                  ${(po.total_amount || po.totalAmount) 
                    ? Number(po.total_amount || po.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                    : '0.00'}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#fff',
                      backgroundColor: po.status === 'RECEIVED' ? '#28a745' : po.status === 'CANCELLED' ? '#dc3545' : '#17a2b8'
                    }}>
                      {po.status}
                    </span>
                  </td>
                <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    {/* Receive Button: Show if NOT already Received or Cancelled */}
                    {po.status !== 'RECEIVED' && po.status !== 'CANCELLED' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(po.id, 'RECEIVED')}
                        style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '4px 8px' }}
                      >
                        Receive
                      </button>
                    )}
                    {/* Edit Button */}
                    {po.status !== 'CANCELLED' && po.status !== 'RECEIVED' && (
                      <button
                        type="button"
                        onClick={() => handleEdit(po)}
                        style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '4px 8px' }}
                      >
                        Edit
                      </button>
                    )}
                    {/* Cancel Button: Show if NOT already Cancelled or Received */}
                    {po.status !== 'CANCELLED' && po.status !== 'RECEIVED' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(po.id, 'CANCELLED')}
                        style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
