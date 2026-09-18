import React, { useState, useEffect } from 'react';
import PoHeaderDetails from './PoHeaderDetails';
import PoLineItems from './PoLineItems';
import PoSummary from './PoSummary';
import PoTable from './PoTable';
import api from '../../services/api';

const commonInputStyle = {
  width: '100%',
  padding: '8px 12px',
  fontSize: '14px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff',
};

export default function PurchaseOrders({ token, baseUrl }) {
  const [items, setItems] = useState([{ description: '', qty: 1, unitPrice: '', currency: 'SGD' }]);
  const [pos, setPos] = useState([]);
  const [error, setError] = useState('');
  
  const [poNumber, setPoNumber] = useState('');
  const [vendor, setVendor] = useState('');
  const [costCentre, setCostCentre] = useState(''); // <-- Add this
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [file, setFile] = useState(null);
  const [editingPoId, setEditingPoId] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  const getHeaders = () => {
    const activeToken = token 
      || localStorage.getItem('token') 
      || localStorage.getItem('access') 
      || localStorage.getItem('access_token');

    return {
      'Content-Type': 'application/json',
      'Authorization': activeToken ? `Bearer ${activeToken}` : ''
    };
  };
  // Initial State Definition
  const initialFormState = {
    po_number: '',
    vendor_name: '',
    cost_centre: '',
    remarks: '',
    status: 'PENDING',
    items: []
  };
  // When clicking "Edit" on an existing PO
  const handleEdit = (po) => {
    setEditingPoId(po.id);
    setPoNumber(po.po_number);
    setVendor(po.vendor_name);
    setCostCentre(po.cost_centre || '');
    setRemarks(po.remarks || '');
    setStatus(po.status);
    setFormData({
      id: po.id,
      po_number: po.po_number,
      vendor_name: po.vendor_name,
      cost_centre: po.cost_centre || '',
      remarks: po.remarks || '',
      status: po.status,
      items: po.items_detail || po.items || []
    });
    setIsEditing(true);
  };
  const fetchPOs = async () => {
    try {
      //const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
      const res = await fetch(`${baseUrl}/purchase-orders/`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch purchase orders.');
      const data = await res.json();
      setPos(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    }
  };
  // Example of fetching purchase orders with an Authorization header
  const fetchPurchaseOrders = async () => {
    try {
      const response = await axios.get(`${baseUrl}/purchase-orders/`, {
        headers: getHeaders()
      });
      setPurchaseOrders(response.data);
    } catch (err) {
      console.error("Error fetching purchase orders:", err);
    }
  };
  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const handleItemChange = (index, field, value) => {
    setItems((prevItems) => {
      const updated = [...prevItems];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };
  const handleAddItem = () => {
    setItems([...items, { description: '', qty: 1, unitPrice: '', currency: 'SGD' }]);
  };
  const handleCancel = () => {
    setEditingPoId(null);
    setPoNumber('');
    setVendor('');
    setCostCentre(''); // <-- Add here
    setRemarks('');    // <-- Add here
    setStatus('PENDING');
    setItems([]);
  };
  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };
  const handleResetForm = () => {
    setEditingPoId(null);
    setPoNumber('');
    setVendor('');
    setStatus('PENDING');
    setItems([{ description: '', qty: 1, unitPrice: '', currency: 'SGD' }]);
    setFile(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingPoId 
      ? `${baseUrl}/purchase-orders/${editingPoId}/` 
      : `${baseUrl}/purchase-orders/`;
    const method = editingPoId ? 'PATCH' : 'POST';

    const formData = new FormData();
    formData.append('po_number', poNumber);
    formData.append('vendor_name', vendor); 
    formData.append('status', status);
    formData.append('items', JSON.stringify(items));

    if (file) {
      formData.append('supporting_document', file);
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Authorization': `Token ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(editingPoId ? 'Failed to update purchase order' : 'Failed to create purchase order');
      }
      handleResetForm();
      fetchPOs();
      alert(editingPoId ? 'Purchase Order updated successfully!' : 'Purchase Order created successfully!');
    } catch (err) {
      console.error('Error handling PO Submission:', err);
      alert(err.message);
    }
  };
  const handleStatusChange = async (poId, newStatus) => {
    try {
      const response = await fetch(`${baseUrl}/purchase-orders/${poId}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchPOs();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };
  const totalsByCurrency = items.reduce((acc, item) => {
    const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);
    const curr = item.currency || 'SGD';
    acc[curr] = (acc[curr] || 0) + lineTotal;
    return acc;
  }, {});

  return (
    <div style={{ padding: '10px 0' }}>
      <h3 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>📦 Purchase Orders (PO)</h3>
      {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}

      <form 
        onSubmit={handleSubmit} 
        style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '750px', margin: '0 auto 30px auto', textAlign: 'left' }}
      >
        <h4 style={{ textAlign: 'center', margin: '0 0 5px 0', fontSize: '18px', fontWeight: '500' }}>
          {editingPoId ? 'Edit PO' : 'Create New PO'}
        </h4>

        <PoHeaderDetails
          poNumber={poNumber}
          setPoNumber={setPoNumber}
          vendor={vendor}
          setVendor={setVendor}
          costCentre={costCentre}
          setCostCentre={setCostCentre}
          remarks={remarks}
          setRemarks={setRemarks}
          status={status}
          setStatus={setStatus}
        />

        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '15px 0' }} />
        {/* Line Items */}
        <PoLineItems
          items={items}
          handleItemChange={handleItemChange}
          handleAddItem={handleAddItem}
          handleRemoveItem={handleRemoveItem}
        />

        {/* Remarks Section */}
        <div style={{ margin: '15px 0' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333', display: 'block', marginBottom: '5px' }}>
            Remarks
          </label>
          <textarea
            rows={2}
            value={remarks || ''}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any internal remarks or notes..."
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxSizing: 'border-box',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Total Summary */}
        <PoSummary totalsByCurrency={totalsByCurrency} />

        <div style={{ marginTop: '12px', marginBottom: '12px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
            Attach Supporting Document (PDF / Doc):
          </label>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])} 
            accept=".pdf,.doc,.docx"
            style={{ fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            type="submit"
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: editingPoId ? '#28a745' : '#0d6efd',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            {editingPoId ? 'Update Purchase Order' : 'Create Purchase Order'}
          </button>

          {editingPoId && (
            <button 
              type="button" 
              onClick={handleResetForm} 
              style={{ padding: '12px 20px', backgroundColor: '#6c757d', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <PoTable 
        purchaseOrders={purchaseOrders} 
        handleEdit={handleEdit} 
        handleCancel={handleCancel} 
      />    

      {/* 
        NOTE: Old incorrect prop passing snippet kept for reference. 
        Passed single loop variable 'pos' instead of the 'purchaseOrders' state array.
      */}
      {/* <PoTable
        purchaseOrders={pos}
        handleEdit={(po) => {
          setEditingPoId(po.id);
          setPoNumber(po.po_number || '');
          setVendor(po.vendor_name || '');
          setStatus(po.status || 'PENDING');
          
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
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        handleCancel={(po) => {
          if (window.confirm(`Are you sure you want to cancel PO ${po.po_number}?`)) {
            handleStatusChange(po.id, 'CANCELLED');
          }
        }}
      /> */}
    </div>
  );
}