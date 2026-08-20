import React, { useState } from 'react';

export default function InvoiceRecordTable({
    invoices = [],
    handleEdit,
    handleDelete
  }){
  const [expandedRowId, setExpandedRowId] = useState(null);

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
          {invoices.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: '15px', textAlign: 'center', color: '#777' }}>
                No invoice records found.
              </td>
            </tr>
          ) : (
            invoices.map((inv) => {
              const isExpanded = expandedRowId === inv.id;
              const formattedAmount = typeof inv.total_amount === 'number'
                ? inv.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })
                : parseFloat(inv.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

              return (
                <React.Fragment key={inv.id}>
                  <tr
                    style={{ borderBottom: '1px solid #dee2e6', cursor: 'pointer' }}
                    onClick={() => toggleRow(inv.id)}
                  >
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
                            {(inv.items || []).map((item, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '6px' }}>{item.description}</td>
                                <td style={{ padding: '6px', textAlign: 'center' }}>{item.qty}</td>
                                <td style={{ padding: '6px', textAlign: 'right' }}>
                                  ${parseFloat(item.unitPrice || 0).toFixed(2)}
                                </td>
                                <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>
                                  ${((parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2)}
                                </td>
                              </tr>
                            ))}
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