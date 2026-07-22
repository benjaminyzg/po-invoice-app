import React from 'react';

/**
 * Reusable DataTable component
 * 
 * @param {Array} headers - Array of header strings or objects (e.g. ['Invoice #', 'Vendor', 'Amount', 'Status', 'Actions'])
 * @param {Array} data - The dataset to render
 * @param {Function} renderRow - Render prop function returning a <tr> for each data item
 * @param {Boolean} loading - Optional loading state
 * @param {String} emptyMessage - Message when data array is empty
 */
export default function DataTable({ 
  headers = [], 
  data = [], 
  renderRow, 
  loading = false, 
  emptyMessage = "No records found." 
}) {
  return (
    <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            {headers.map((header, idx) => (
              <th 
                key={idx} 
                style={{ 
                  padding: '12px 16px', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#475569' 
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => renderRow(item, index))
          )}
        </tbody>
      </table>
    </div>
  );
}