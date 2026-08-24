import React from 'react';

const containerStyle = {
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  padding: '30px',
  backgroundColor: '#ffffff',
  color: '#1f2937',
  fontFamily: 'Helvetica, Arial, sans-serif',
  boxSizing: 'border-box'
};

const tableHeaderStyle = {
  backgroundColor: '#f3f4f6',
  color: '#374151',
  fontWeight: 'bold',
  fontSize: '12px',
  textTransform: 'uppercase',
  padding: '10px 12px',
  borderBottom: '2px solid #e5e7eb',
  textAlign: 'left'
};

const tableCellStyle = {
  padding: '10px 12px',
  fontSize: '13px',
  borderBottom: '1px solid #f3f4f6'
};

export default function InvoicePdfTemplate({ invoice, companySettings, elementId = "printable-invoice" }) {
  if (!invoice) return null;

  return (
    <div id={elementId} style={containerStyle}>
      {/* 1. Header: Logo & Company Profile | Document Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2563eb', paddingBottom: '20px', marginBottom: '25px' }}>
        <div style={{ maxWidth: '50%' }}>
          {companySettings?.logo && (
            <img 
              src={companySettings.logo} 
              alt="Logo" 
              style={{ maxHeight: '60px', maxWidth: '200px', objectFit: 'contain', marginBottom: '10px' }} 
            />
          )}
          <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#111827' }}>
            {companySettings?.company_name || 'My Company'}
          </h2>
          {companySettings?.tax_registration_no && (
            <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#6b7280' }}>
              UEN/Tax Reg: {companySettings.tax_registration_no}
            </p>
          )}
          <p style={{ margin: '0', fontSize: '12px', color: '#6b7280', whiteSpace: 'pre-line' }}>
            {companySettings?.registered_address}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
            {companySettings?.phone && `Tel: ${companySettings.phone}`} {companySettings?.email && `| Email: ${companySettings.email}`}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px' }}>
            INVOICE
          </h1>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold' }}>
            Invoice #: <span style={{ color: '#111827' }}>{invoice.invoice_number || invoice.id}</span>
          </p>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>
            Date: {invoice.issued_date || new Date().toLocaleDateString()}
          </p>
          {invoice.po_number && (
            <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>
              Ref PO #: {invoice.po_number}
            </p>
          )}
        </div>
      </div>

      {/* 2. Bill To / Vendor Information */}
      <div style={{ marginBottom: '25px', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '6px' }}>
        <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>
          Billed To:
        </p>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#111827' }}>
          {invoice.vendor || 'Customer Name'}
        </h4>
        {invoice.remarks && (
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
            Remarks: {invoice.remarks}
          </p>
        )}
      </div>

      {/* 3. Line Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px' }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Description</th>
            <th style={{ ...tableHeaderStyle, textAlign: 'center', width: '80px' }}>Quantity</th>
            <th style={{ ...tableHeaderStyle, textAlign: 'right', width: '110px' }}>Unit Price ($)</th>
            <th style={{ ...tableHeaderStyle, textAlign: 'right', width: '110px' }}>Total Amount ($)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items && invoice.items.length > 0 ? (
            invoice.items.map((item, idx) => (
              <tr key={idx}>
                <style>{`td { border-bottom: 1px solid #f3f4f6; }`}</style>
                <td style={tableCellStyle}>{item.description || '—'}</td>
                <td style={{ ...tableCellStyle, textAlign: 'center' }}>{item.qty || item.quantity || 1}</td>
                <td style={{ ...tableCellStyle, textAlign: 'right' }}>{Number(item.unitPrice || item.unit_price || 0).toFixed(2)}</td>
                <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                  {((item.qty || item.quantity || 1) * (item.unitPrice || item.unit_price || 0)).toFixed(2)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ ...tableCellStyle, textAlign: 'center', color: '#9ca3af' }}>No items recorded.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 4. Total Summary */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '35px' }}>
        <div style={{ width: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #111827', fontWeight: 'bold', fontSize: '15px' }}>
            <span>Grand Total (SGD):</span>
            <span style={{ color: '#2563eb' }}>
              ${Number(invoice.total_amount || invoice.items?.reduce((acc, i) => acc + (i.qty || 1) * (i.unitPrice || 0), 0) || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Banking & Payment Details Footer */}
      {(companySettings?.bank_name || companySettings?.paynow_uen) && (
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '15px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '6px' }}>
          <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', color: '#334155' }}>
            💳 Payment Instructions
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', color: '#475569' }}>
            <div>
              {companySettings.bank_name && <p style={{ margin: '0 0 2px 0' }}><strong>Bank:</strong> {companySettings.bank_name}</p>}
              {companySettings.account_name && <p style={{ margin: '0 0 2px 0' }}><strong>Account Name:</strong> {companySettings.account_name}</p>}
              {companySettings.account_number && <p style={{ margin: '0' }}><strong>Account No:</strong> {companySettings.account_number}</p>}
            </div>
            <div>
              {companySettings.swift_code && <p style={{ margin: '0 0 2px 0' }}><strong>SWIFT Code:</strong> {companySettings.swift_code}</p>}
              {companySettings.paynow_uen && <p style={{ margin: '0' }}><strong>PayNow UEN:</strong> {companySettings.paynow_uen}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}