import React, { useState, useEffect } from 'react';
import InvoiceHeaderDetails from './InvoiceHeaderDetails';
import InvoiceLineItems from './InvoiceLineItems';
import InvoiceSummary from './InvoiceSummary';
import InvoiceRecordTable from './InvoiceRecordTable';
import CardContainer from '../common/CardContainer';

export default function Invoices() {
  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [vendor, setVendor] = useState('');
  const [issuedDate, setIssuedDate] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState([{ description: '', qty: 1, unitPrice: 0 }]);
  const [creditTerm, setCreditTerm] = useState('30'); // default value
  
  // Records & Catalog State
  const [invoices, setInvoices] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Fetch Invoices and Catalog Items on Mount
  useEffect(() => {
    fetchInvoices();
    fetchCatalogItems();
  }, []);
  const fetchInvoices = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/invoices/');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };
  const fetchCatalogItems = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/catalog-items/');
      if (response.ok) {
        const data = await response.json();
        setCatalogItems(data);
      }
    } catch (error) {
      console.error('Error fetching catalog items:', error);
    }
  };
  // Calculate Grand Total
  const grandTotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0),
    0
  );
  // Form Reset Helper
  const resetForm = () => {
    setInvoiceNumber('');
    setVendor('');
    setIssuedDate('');
    setPoNumber('');
    setStatus('PENDING');
    setRemarks('');
    setItems([{ description: '', qty: 1, unitPrice: 0 }]);
    setSelectedCatalogId('');
    setIsEditing(false);
    setEditingId(null);
  };
  // Line Item Handlers
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };
  const handleAddItem = () => {
    setItems([...items, { description: '', qty: 1, unitPrice: 0 }]);
  };
  // Quick Select Catalog Item Handler
  const handleCatalogSelect = (e) => {
    const catalogId = e.target.value;
    setSelectedCatalogId(catalogId);
    if (!catalogId) return;

    const matchedItem = catalogItems.find((ci) => ci.id.toString() === catalogId);
    if (matchedItem) {
      setItems([
        ...items,
        {
          description: matchedItem.description || '',
          qty: 1,
          unitPrice: matchedItem.unit_price || 0
        }
      ]);
    }
  };
  // Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/invoices/${id}/`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchInvoices();
      } else {
        alert('Failed to delete invoice.');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };
  // Edit Trigger Handler
  const handleEdit = (inv) => {
    setIsEditing(true);
    setEditingId(inv.id);
    setInvoiceNumber(inv.invoice_number || '');
    setVendor(inv.vendor_name || '');
    setIssuedDate(inv.issued_date || '');
    setPoNumber(inv.po_number || '');
    setStatus(inv.status || 'PENDING');
    setRemarks(inv.remarks || '');
    setItems(
      inv.items && inv.items.length > 0
        ? inv.items.map((i) => ({
            description: i.description,
            qty: i.qty,
            unitPrice: i.unitPrice
          }))
        : [{ description: '', qty: 1, unitPrice: 0 }]
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // Submit Handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      invoice_number: invoiceNumber,
      vendor_name: vendor,
      issued_date: issuedDate,
      po_number: poNumber  || null,
      credit_terms: creditTerm,
      status: status.toLowerCase(),
      remarks: remarks,
      total_amount: grandTotal,
      items: items.map(item => ({
        description: item.description,
        quantity: parseInt(item.qty || item.quantity || 0, 10),
        unit_price: parseFloat(item.unitPrice || item.unit_price || 0) 
      }))
    };

    try {
      const url = isEditing
        ? `http://localhost:8000/api/invoices/${editingId}/`
        : 'http://localhost:8000/api/invoices/';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(isEditing ? 'Invoice updated successfully!' : 'Invoice created successfully!');
        resetForm();
        fetchInvoices();
      } else {
        const errData = await response.json();
        alert('Failed to save invoice: ' + JSON.stringify(errData));
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Network error while saving invoice.');
    }
  };
  const handleRemoveItem = (index) => {
    if (items.length === 1) return; // Keep at least one row
    setItems(items.filter((_, i) => i !== index));
  };
  return (
    <div>
      <CardContainer title="Invoices" subtitle="Create New Invoice" maxWidth="100%">
        <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
          {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
        </h2>
        </div>
        {/* Quick Select Catalog Item */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px', color: '#444' }}>
            Quick Select Catalog Item:
          </label>
          <select
            value={selectedCatalogId}
            onChange={handleCatalogSelect}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
          >
            <option value="">-- Select Predefined Catalog Item --</option>
            {catalogItems.map((ci) => (
              <option key={ci.id} value={ci.id}>
                {ci.description} (${ci.unit_price})
              </option>
            ))}
          </select>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Header Details Sub-component */}
          <InvoiceHeaderDetails
            invoiceNumber={invoiceNumber}
            setInvoiceNumber={setInvoiceNumber}
            vendor={vendor}
            setCreditTerm={setCreditTerm}
            setVendor={setVendor}
            issuedDate={issuedDate}
            setIssuedDate={setIssuedDate}
            poNumber={poNumber}
            setPoNumber={setPoNumber}
            status={status}
            setStatus={setStatus}
            creditTerm={creditTerm}       // <-- Add this
            setCreditTerm={setCreditTerm} // <-- Add this
          />

          {/* Line Items Sub-component */}
          <InvoiceLineItems
            items={items}
            handleItemChange={handleItemChange}
            handleAddItem={handleAddItem}
            handleRemoveItem={handleRemoveItem}
          />

        {/* Summary & Remarks Sub-component */}
        <InvoiceSummary
          remarks={remarks}
          setRemarks={setRemarks}
          grandTotal={grandTotal}
          isEditing={isEditing}
        />
        </form>
      </CardContainer>

      {/* Keep InvoiceRecordTable below the container */}
      <div style={{ maxWidth: '900px', margin: '24px auto' }}></div>
      <InvoiceRecordTable
        invoices={invoices}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    </div>
  )
}
