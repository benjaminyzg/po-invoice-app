import React, { useState, useEffect } from 'react';

function PurchaseOrderRow({ po, baseUrl, token, onStatusUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ ...po });

  // 1. Format Currency with commas ($1,234,500.00)
  const formattedAmount = po.total_amount 
    ? `$${Number(po.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '$0.00';

    // 2. Resolve Vendor Name (handles both string and object shapes)
    const vendorDisplay = po.vendor_name || (typeof po.vendor === 'object' ? po.vendor?.name : po.vendor) || 'N/A';

  // 2. Add the Cancel handler function
  const handleCancel = async () => {
    // 1. First, check if click reaches here
    console.log("Cancel button clicked for PO:", po);

    const confirmed = window.confirm(`Are you sure you want to cancel ${po.po_number}?`);
    if (!confirmed) return;

    if (!window.confirm(`Are you sure you want to cancel PO ${po.po_number}?`)) return;

    setIsCancelling(true);
    try {
      const response = await fetch(`${baseUrl}/purchase-orders/${po.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`, // or `Token ${token}` depending on backend
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        // Trigger refetch in parent component to update the UI
        if (onStatusUpdate) onStatusUpdate();
      } else {
        const errorData = await response.json();
        alert(`Failed to cancel PO: ${errorData.detail || response.statusText}`);
      }
    } catch (err) {
      console.error('Error cancelling PO:', err);
      alert('Network error while attempting to cancel.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleEditClick = () => {
  setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      // Send updated PO data to backend
      const response = await fetch(`/api/purchase-orders/${po.id}/`, {
        method: 'PUT', // or PATCH
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        setIsEditing(false);
        // Trigger a refresh/re-fetch of the PO list here if needed
        onRefresh && onRefresh();
      } else {
        alert('Failed to update Purchase Order');
      }
    } catch (error) {
      console.error('Error updating PO:', error);
    }

  return (
    <>
      <tr className="po-row">
        {/* ... your other <td> cells ... */}
        <td>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginRight: '8px',
              fontSize: '12px'
            }}
          >
            {isExpanded ? '▼' : '►'}
          </button>
          {po.po_number}
        </td>
        
        <td>{vendorDisplay}</td>
        <td>{formattedAmount}</td>
        <td>{po.status}</td>
        <td>{po.items?.length || 0}</td>
        {/* Actions Cell */}
        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'left' }}>
          <button 
            type="button"
            onClick={() => handleEdit(po)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#0d6efd',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            EDIT
          </button>
          
          <button 
            onClick={handleCancel}
            disabled={po.status === 'CANCELLED' || isCancelling}
            style={{ 
              backgroundColor: po.status === 'CANCELLED' ? '#ccc' : '#dc3545', 
              color: '#fff', 
              border: 'none', 
              padding: '3px 8px', 
              borderRadius: '3px',
              cursor: po.status === 'CANCELLED' ? 'not-allowed' : 'pointer'
            }}
          >
            {isCancelling ? 'Cancelling...' : 'CANCEL'}
          </button>
          </div>
        </td>
      </tr>
      
      {/* Expanded row JSX if any */}
      {/* Expandable items section */}
      {isExpanded && (
        <tr className="po-details-row">
          <td colSpan="6" style={{ backgroundColor: '#f8f9fa', padding: '15px 25px' }}>
            <div style={{ borderLeft: '3px solid #0d6efd', paddingLeft: '15px' }}>
              <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#495057' }}>
                Line Items Detail
              </h5>
              
              {po.items && po.items.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #dee2e6', textAlign: 'left', color: '#6c757d' }}>
                      <th style={{ padding: '8px 4px' }}>Item Description</th>
                      <th style={{ padding: '8px 4px', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right' }}>Total Amt ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {po.items.map((item, idx) => {
                      const qty = Number(item.quantity || item.qty || 0);
                      const price = Number(item.unit_price || 0);
                      const lineTotal = qty * price;

                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #e9ecef' }}>
                          <td style={{ padding: '8px 4px' }}>{item.description}</td>
                          <td style={{ padding: '8px 4px', textAlign: 'center' }}>{qty}</td>
                          <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                            ${price.toFixed(2)}
                          </td>
                          <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                            ${lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p style={{ margin: 0, color: '#6c757d', fontStyle: 'italic', fontSize: '13px' }}>
                  No line items recorded for this purchase order.
                </p>
              )}
            </div>
          </td>
        </tr>)}
      {/* --- EDIT MODAL GOES HERE --- */}
      {isEditing && (
        <EditPOModal 
          po={editFormData} 
          setEditFormData={setEditFormData}
          onClose={() => setIsEditing(false)}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
  }
}

export default function PurchaseOrderList({ pos, token, baseUrl }) {
  const [selectedPoToEdit, setSelectedPoToEdit] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${baseUrl}/purchase-orders/`, {
      headers: {
        'Authorization': `Bearer ${token}`, // Swap to 'Token ' if using Django TokenAuth
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setPurchaseOrders(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching POs:', err);
        setLoading(false);
      });
  }, [baseUrl, token]);

  const fetchPOs = async () => {
    try {
      const res = await fetch(`${baseUrl}/purchase-orders/`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch purchase orders.');
      const data = await res.json();
      setPos(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading Purchase Orders...</div>;
  if (!purchaseOrders.length) return <div style={{ padding: '20px' }}>No purchase orders found.</div>;

  return (
    <div className="po-list-wrapper">
      <h3>Purchase Orders/Records</h3>
      <table className="main-po-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
            <th>PO Number</th>
            <th>Vendor</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchaseOrders.map((po) => (
            <PurchaseOrderRow key={po.id || po.po_number} 
            key={po.id}
            po={po}
            baseUrl={baseUrl}
            token={token}
            onStatusUpdate={fetchPOs} 
            />
          ))}
        </tbody>
      </table>

      {/* --- EDIT MODAL AT TABLE ROOT LEVEL --- */}
      {selectedPoToEdit && (
        <EditPOModal 
          po={selectedPoToEdit} 
          onClose={() => setSelectedPoToEdit(null)} 
          onRefresh={fetchPurchaseOrders}
        />
      )}
    </div>
  );
}