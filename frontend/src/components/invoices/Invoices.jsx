import React, { useState, useEffect } from 'react';
import InvoiceHeaderDetails from './InvoiceHeaderDetails';
import InvoiceLineItems from './InvoiceLineItems';
import InvoiceSummary from './InvoiceSummary';
import InvoiceRecordTable from './InvoiceRecordTable';
import CardContainer from '../common/CardContainer';
import Button from '../common/Button';
import ExportPdfButton from '../common/ExportPdfButton';
import { InvoicePdfTemplate } from '../PdfTemplate.jsx';
import { InvoicePreview } from './InvoicePreview';
import axios from 'axios';

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

export default function Invoices({ token, baseUrl }) {
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
  const [companySettings, setCompanySettings] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null); // Or active selected invoice item
  const [lastDeleted, setLastDeleted] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const invoicesArray = Array.isArray(invoices) ? invoices : (invoices?.results || []);

  // 1. Define fetchCompanySettings
  const fetchCompanySettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/company-settings/1/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCompanySettings(data);
      }
    } catch (err) {
      console.error('Failed to load company settings:', err);
    }
  };
  // 2. Define fetchInvoices
  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/invoices/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        const records = Array.isArray(data) ? data : data.results || [];
        setInvoices(records);
      }
    } catch (err) {
      console.error('Error loading invoices:', err);
    }
  };

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/invoices/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setInvoices(Array.isArray(data) ? data : (data.results || []));
      } catch (error) {
        console.error('Error loading invoices:', error);
      }
    };
    loadInvoices();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'all') return true;
    return inv.status === statusFilter;
  });
  const fetchCatalogItems = async () => {
    console.log("Token value being sent:", token);
    try {
      const response = await fetch(`${baseUrl}/catalog-items/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCatalogItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch catalog items:', error);
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
  // Fallback to form draft if no saved invoice is selected
  const activeInvoiceData = selectedInvoice || {
    invoice_number: invoiceNumber,
    vendor: vendor,
    issued_date: issuedDate,
    po_number: poNumber,
    items: items,
    remarks: remarks
  };
  const handleRemoveItem = (index) => {
    if (items.length === 1) return; // Keep at least one row
    setItems(items.filter((_, i) => i !== index));
  };
  const handleSelectInvoice = async (inv) => {
    // If line items are already present, set directly
    if (inv.items && inv.items.length > 0) {
      setSelectedInvoice(inv);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to the PDF preview
      return;
        }

        // Otherwise, fetch full invoice details (including line items) from Django API
        try {
          const res = await fetch(`${baseUrl}/invoices/${inv.id}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const fullInvoice = await res.json();
            setSelectedInvoice(fullInvoice);
          } else {
            setSelectedInvoice(inv);
          }
        } catch (err) {
          console.error('Error fetching invoice details:', err);
          setSelectedInvoice(inv);
        }
    // Smooth scroll up to view the preview
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleMarkAsPaid = async (invoiceId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/invoices/${invoiceId}/mark-paid/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include if using auth tokens
        },
      });

      if (response.ok) {
        const updatedInvoice = await response.json();
        // Update state locally so the table re-renders instantly
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === invoiceId ? updatedInvoice : inv))
        );
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };
  const handleCancelInvoice = async (invoiceId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/invoices/${invoiceId}/cancel/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedInvoice = await response.json();
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === invoiceId ? updatedInvoice : inv))
        );
      }
    } catch (error) {
      console.error('Error cancelling invoice:', error);
    }
  };
  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/invoices/${invoiceId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove deleted item from state
        setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };
  const handleRestore = async () => {
    if (!lastDeleted) return;
    const res = await axios.patch(
      `${baseUrl}/api/invoices/${lastDeleted.id}/restore/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setInvoices([res.data, ...invoices]); // Re-insert into table view
    setLastDeleted(null); // Hide toast
  };
  return (
    <div>
      <CardContainer title="Invoices" subtitle="Create New Invoice" maxWidth="100%">
        {/* Hidden print template wrapper */}
        <div className="hidden print:block">
          <InvoicePdfTemplate 
          invoice={selectedInvoice} 
          companySettings={companySettings} 
        />
        </div>
        
        <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
            {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
        </div>
        
        {/* Top Action Bar & Dynamic Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>
              📄 {selectedInvoice ? `Viewing Saved Record: ${selectedInvoice.invoice_number}` : 'Live Invoice Draft Preview'}
            </h3>
            {selectedInvoice && (
              <button 
                onClick={() => setSelectedInvoice(null)}
                style={{ fontSize: '12px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '4px' }}
              >
                ← Switch back to Live Form Draft
              </button>
            )}
          </div>

          <ExportPdfButton 
            elementId="printable-invoice" 
            fileName={`Invoice_${activeInvoiceData.invoice_number || 'Draft'}.pdf`} 
          />
        </div>

        {/* Printable Invoice Container */}
        <InvoicePdfTemplate 
          invoice={activeInvoiceData}
          invoice={selectedInvoice} 
          companySettings={companySettings} 
          elementId="printable-invoice" 
        />
      
        {/* Quick Select Catalog Item */}
        {/* <div style={{ marginBottom: '20px' }}>
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
        </div> */}
        
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
        invoices={filteredInvoices}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleMarkAsPaid={handleMarkAsPaid}  
        handleCancelInvoice={handleCancelInvoice} 
        onSelectInvoice={handleSelectInvoice}
      />

      {/* Floating Undo Toast Notification */}
      {lastDeleted && (
        <div className="fixed bottom-6 right-6 flex items-center gap-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg z-50">
          <span className="text-sm">
            Invoice <strong>{lastDeleted.invoice_number}</strong> deleted.
          </span>
          <button
            onClick={handleRestore}
            className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1 px-3 rounded transition"
          >
            Undo
          </button>
          <button
            onClick={() => setLastDeleted(null)}
            className="text-gray-400 hover:text-white text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
