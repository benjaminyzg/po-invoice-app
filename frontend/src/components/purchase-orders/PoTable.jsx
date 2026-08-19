import React, { useState } from 'react';

export default function PoTable({ purchaseOrders, handleEdit, handleCancel }) {
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
            const items = po.items_detail || po.items || [];
            return (
              <React.Fragment key={po.id || po.po_number}>
                <tr style={{ borderBottom: '1px solid #f1f3f5', transition: 'background-color 0.15s' }}>
                  <td style={{ textAlign: 'center', padding: '10px 4px' }}>
                    <button
                      type="button"
                      onClick={() => toggleExpand(po.id)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', color: '#6c757d', padding: '2px 4px' }}
                    >
                      {isExpanded ? '▼' : '►'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'left', padding: '10px', fontWeight: '500' }}>{po.po_number}</td>
                  <td style={{ textAlign: 'left', padding: '10px' }}>{po.vendor_name}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>
                    ${Number(po.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                        style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#f8f9fa', border: '1px solid #ced4da', borderRadius: '4px' }}
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
                {isExpanded && (
                  <tr>
                    <td colSpan="6" style={{ backgroundColor: '#fdfdfd', padding: '12px 24px', borderBottom: '1px solid #e9ecef' }}>
                      <p><strong>Cost Centre:</strong> {po.cost_centre || 'N/A'}</p>
                      <p><strong>Remarks:</strong> {po.remarks || 'None'}</p>
                      <div style={{ fontSize: '13px' }}>
                        <span style={{ fontWeight: '600', color: '#495057' }}>Line Items Detail</span>
                        {items.length > 0 ? (
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
                              {items.map((item, idx) => {
                                const qty = Number(item.qty || item.quantity || 1);
                                const price = Number(item.unit_price || item.unitPrice || 0);
                                const rowTotal = qty * price;
                                return (
                                  <tr key={idx} style={{ borderBottom: '1px solid #f1f3f5' }}>
                                    <td style={{ padding: '6px', textAlign: 'left' }}>{item.description}</td>
                                    <td style={{ padding: '6px', textAlign: 'center' }}>{qty.toLocaleString('en-US')}</td>
                                    <td style={{ padding: '6px', textAlign: 'right' }}>${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td style={{ padding: '6px', textAlign: 'right' }}>${rowTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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