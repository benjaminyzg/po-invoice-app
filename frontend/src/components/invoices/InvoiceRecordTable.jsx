import React, { useState } from 'react';
import { validateInvoiceMatch } from '../../services/api';
import { MatchResultModal } from './MatchResultModal';

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
                    <td style={{ padding: '10px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(inv)}
                        style={{
                          padding: '4px 10px',
                          marginRight: '6px',
                          backgroundColor: '#28a745',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(inv.id)}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                      {/* Export Button */}
                      <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents expanding/collapsing the row when exporting
                            if (onSelectInvoice) onSelectInvoice(inv);
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            borderRadius: '4px',
                            border: '1px solid #2563eb',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginRight: '6px'
                          }}
                        >
                        📄 View / Export
                      </button>
                      {/* Mark Paid Button */}
                      {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                        <button
                          onClick={() => handleMarkAsPaid(inv.id)}
                          className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-semibold py-1 px-2 rounded"
                        >
                          Mark Paid
                        </button>
                      )}
                      {/* Cancel Button */}
                      {inv.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelInvoice(inv.id)}
                          className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 font-semibold py-1 px-2 rounded"
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        onClick={() => handleValidateMatch(inv.id)} 
                        disabled={loadingId === inv.id || !inv.purchase_order}
                        style={{ marginRight: '8px' }}
                      >
                        {loadingId === inv.id ? 'Matching...' : 'Validate Match'}
                      </button>
                      </div>
                      {/* Compact PDF Export Dropdown */}
                    <div className="btn-group" style={{ position: 'relative', display: 'inline-block' }}>
                      <button 
                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        📄 PDF Docs ▾
                      </button>
                      <ul className="dropdown-menu shadow">
                        <li>
                          <button 
                            className="dropdown-item" 
                            onClick={() => window.open(`http://127.0.0.1:8000/api/invoices/${inv.id}/export-invoice-pdf/`, '_blank')}
                          >
                            📄 Commercial Invoice
                          </button>
                        </li>
                        <li>
                          <button 
                            className="dropdown-item" 
                            onClick={() => window.open(`http://127.0.0.1:8000/api/invoices/${inv.id}/export-do-pdf/`, '_blank')}
                          >
                            🚚 Delivery Order (DO)
                          </button>
                        </li>
                        <li>
                          <button 
                            className="dropdown-item" 
                            onClick={() => window.open(`http://127.0.0.1:8000/api/invoices/${inv.id}/export-packing-pdf/`, '_blank')}
                          >
                            📦 Packing List
                          </button>
                        </li>
                      </ul>
                    </div>
                    </td>      
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