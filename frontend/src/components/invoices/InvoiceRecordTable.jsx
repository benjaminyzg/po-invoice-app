import React, { useState } from 'react';
import { validateInvoiceMatch } from '../../services/api';
import { MatchResultModal } from './MatchResultModal';

// Helper styling for dropdown items
const dropdownItemStyle = {
  display: 'block',
  width: '100%',
  padding: '8px 12px',
  fontSize: '12px',
  color: '#334155',
  backgroundColor: 'transparent',
  border: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease'
};
function RowActions({ inv, handleEdit, handleDelete, handleMarkAsPaid, handleCancelInvoice }) {
  const [openPdf, setOpenPdf] = useState(false);
  const [openActions, setOpenActions] = useState(false);

  return (
    <td style={{ padding: '8px 10px', textAlign: 'center', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        {/* 1. Primary Direct Action */}
        {handleEdit && (
          <button
            type="button"
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              backgroundColor: '#ffffff',
              color: '#2563eb',
              border: '1px solid #2563eb',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            onClick={() => handleEdit(inv)}
          >
            Edit
          </button>
        )}
        {/* 2. Document Export Dropdown */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            type="button"
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              backgroundColor: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            onClick={() => {
              setOpenPdf(!openPdf);
              setOpenActions(false);
            }}
          >
            📄 PDF Docs ▾
          </button>

          {openPdf && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '4px',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              zIndex: 1000,
              minWidth: '160px',
              overflow: 'hidden'
            }}>
              {/* 1. Commercial Invoice */}
<button
  type="button"
  style={dropdownItemStyle}
  onClick={() => {
    window.open(`http://127.0.0.1:8000/api/invoices/${inv.id}/export-invoice-pdf/`, '_blank');
    setOpenPdf(false);
  }}
  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f1f5f9')}
  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
>
  Commercial Invoice
</button>

{/* 2. Delivery Order (DO) */}
<button
  type="button"
  style={dropdownItemStyle}
  onClick={() => {
    window.open(`http://127.0.0.1:8000/api/invoices/${inv.id}/export-do-pdf/`, '_blank');
    setOpenPdf(false);
  }}
  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f1f5f9')}
  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
>
  Delivery Order (DO)
</button>

{/* 3. Packing List */}
<button
  type="button"
  style={dropdownItemStyle}
  onClick={() => {
    window.open(`http://127.0.0.1:8000/api/invoices/${inv.id}/export-packing-pdf/`, '_blank');
    setOpenPdf(false);
  }}
  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f1f5f9')}
  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
>
  Packing List
</button>
            </div>
          )}
        </div>
        {/* 3. Workflow Actions Dropdown */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            type="button"
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              backgroundColor: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            onClick={() => {
              setOpenActions(!openActions);
              setOpenPdf(false);
            }}
          >
            Actions ▾
          </button>

          {openActions && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '4px',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              zIndex: 1000,
              minWidth: '140px',
              overflow: 'hidden'
            }}>
              {inv.status !== 'paid' && inv.status !== 'cancelled' && handleMarkAsPaid && (
                <button
                  type="button"
                  style={dropdownItemStyle}
                  onClick={() => { handleMarkAsPaid(inv.id); setOpenActions(false); }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Mark Paid
                </button>
              )}
              {inv.status !== 'cancelled' && handleCancelInvoice && (
                <button
                  type="button"
                  style={dropdownItemStyle}
                  onClick={() => { handleCancelInvoice(inv.id); setOpenActions(false); }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Cancel Invoice
                </button>
              )}
              {handleDelete && (
                <button
                  type="button"
                  style={{ ...dropdownItemStyle, color: '#dc2626', borderTop: '1px solid #f1f5f9' }}
                  onClick={() => { handleDelete(inv.id); setOpenActions(false); }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </td>
  );
}
export default function InvoiceRecordTable({invoices = [], handleEdit, handleDelete, handleMarkAsPaid, handleCancelInvoice, onSelectInvoice }) {  const [expandedRowId, setExpandedRowId] = useState(null);
  console.log('INVOICES RECEIVED BY TABLE:', invoices); // <-- Add this line
  const [statusFilter, setStatusFilter] = useState('all');
  const [matchResult, setMatchResult] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const displayedInvoices = invoices.filter((inv) => {
  if (statusFilter === 'all') return true;
    return inv.status?.toLowerCase() === statusFilter.toLowerCase();
  });
  const handleValidateMatch = async (invoiceId) => {
    setLoadingId(invoiceId);
    try {
      const data = await validateInvoiceMatch(invoiceId);
      setMatchResult(data);
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to validate match.');
    } finally {
      setLoadingId(null);
    }
  };
  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };
  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'APPROVED':
        return { backgroundColor: '#d4edda', color: '#155724' };
      case 'CANCELLED':
        return { backgroundColor: '#f8d7da', color: '#721c24' };
      default:
        return { backgroundColor: '#fff3cd', color: '#856404' }; // PENDING
    }
  };
  return (
    <div style={{ marginTop: '30px' }}>
      <h3 style={{ textAlign: 'center', color: '#333', marginBottom: '15px', fontSize: '15px', fontWeight: 'bold' }}>
        Invoice Records
      </h3>
      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '15px' }}>
        {['all', 'pending', 'paid', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'capitalize',
              backgroundColor: statusFilter === status ? '#2563eb' : '#e5e7eb',
              color: statusFilter === status ? '#ffffff' : '#374151'
            }}
          >
            {status}
          </button>
        ))}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
            <th style={{ padding: '10px' }}>Invoice #</th>
            <th style={{ padding: '10px' }}>Vendor</th>
            <th style={{ padding: '10px' }}>PO #</th>
            <th style={{ padding: '10px' }}>Amount</th>
            <th style={{ padding: '10px' }}>Status</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedInvoices.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: '15px', textAlign: 'center', color: '#777' }}>
                No invoice records found.
              </td>
            </tr>
          ) : (
            displayedInvoices.map((inv) => {
              const isExpanded = expandedRowId === inv.id;
              // Lines 47-49 in InvoiceRecordTable.jsx
              const rawTotal = (inv.total_amount && Number(inv.total_amount) > 0)
                  ? Number(inv.total_amount)
                  : (inv.items || []).reduce((sum, item) => {
                      const qty = item.quantity ?? item.qty ?? 0;
                      const price = item.unit_price ?? item.unitPrice ?? 0;
                      return sum + (qty * price);
                  }, 0);

              const formattedAmount = rawTotal.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
              });

              return (
                <React.Fragment key={inv.id}>
                  <tr
                    style={{ borderBottom: '1px solid #dee2e6', cursor: 'pointer' }}
                    onClick={() => toggleRow(inv.id)}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>
                      <span style={{ marginRight: '8px', fontSize: '12px' }}>
                        {isExpanded ? '▼' : '►'}
                      </span>
                      {inv.invoice_number}
                    </td>
                    <td style={{ padding: '10px' }}>{inv.vendor_name}</td>
                    <td style={{ padding: '10px' }}>{inv.po_number || '-'}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>
                      ${formattedAmount}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        ...getStatusStyle(inv.status)
                      }}>
                        {inv.status || 'Pending'}
                      </span>
                    </td>
                    {/* Replace lines 309-318 with just this: */}
                    <RowActions
                      inv={inv}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                      handleMarkAsPaid={handleMarkAsPaid}
                      handleCancelInvoice={handleCancelInvoice}
                    />
                  </tr>
                  {/* Expanded Detail Drawer */}
                  {isExpanded && (
                    <tr style={{ backgroundColor: '#fcfcfc', borderBottom: '1px solid #dee2e6' }}>
                      <td colSpan="6" style={{ padding: '15px 25px' }}>
                        {/* Display Saved Remarks */}
                        {inv.remarks && (
                          <div style={{ marginBottom: '12px', padding: '8px 12px', backgroundColor: '#f1f3f5', borderRadius: '4px' }}>
                            <strong style={{ color: '#333' }}>Remarks:</strong> {inv.remarks}
                          </div>
                        )}

                        {/* Line Items Sub-table */}
                        <strong style={{ display: 'block', marginBottom: '8px', color: '#555' }}>Line Items:</strong>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid #ccc', color: '#666' }}>
                                <th style={{ padding: '6px', textAlign: 'left' }}>Description</th>
                                <th style={{ padding: '6px', textAlign: 'center' }}>Qty</th>
                                <th style={{ padding: '6px', textAlign: 'right' }}>Unit Price</th>
                                <th style={{ padding: '6px', textAlign: 'right' }}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(inv.items || []).map((item, idx) => {
                                  // Resolve values with fallback support
                                  const qty = item.quantity ?? item.qty ?? 0;
                                  const unitPrice = item.unit_price ?? item.unitPrice ?? 0;
                                  const total = item.total_amount ?? (qty * unitPrice);

                                  return (
                                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                          <td style={{ padding: '6px' }}>{item.description}</td>
                                          <td style={{ padding: '6px', textAlign: 'center' }}>{qty}</td>
                                          <td style={{ padding: '6px', textAlign: 'right' }}>
                                              ${parseFloat(unitPrice).toFixed(2)}
                                          </td>
                                          <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>
                                              ${parseFloat(total).toFixed(2)}
                                          </td>
                                      </tr>
                                  );
                              })}
                            </tbody>
                          </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}