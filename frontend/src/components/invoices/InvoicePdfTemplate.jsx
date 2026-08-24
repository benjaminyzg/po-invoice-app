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
  borderBottom: '2px solid #e5e7eb'
};

const tableCellStyle = {
  padding: '10px 12px',
  fontSize: '13px',
  borderBottom: '1px solid #f3f4f6'
};

export default function InvoicePdfTemplate({ invoice, companySettings, elementId = "printable-invoice" }) {
  if (!invoice) return null;

  // 1. Customer Details & Addresses
  const customerName = invoice.vendor_name || invoice.vendor || invoice.customer_name || 'Customer Name';
  const billingAddress = invoice.billing_address || invoice.vendor_address || invoice.address || invoice.registered_address;
  const shippingAddress = invoice.shipping_address || invoice.ship_to_address || billingAddress;
  const customerPhone = invoice.vendor_phone || invoice.phone;
  const customerEmail = invoice.vendor_email || invoice.email;
  const creditTerms = invoice.credit_terms || invoice.payment_terms;

  // 2. Line Items & Grand Total
  const items = invoice.items || [];
  const calculatedGrandTotal = items.reduce((sum, item) => {
    const qty = Number(item.qty || item.quantity || 1);
    const price = Number(item.unitPrice || item.unit_price || 0);
    return sum + (qty * price);
  }, 0);

  const grandTotal = Number(invoice.total_amount) > 0 
    ? Number(invoice.total_amount) 
    : calculatedGrandTotal;

  return (
    <div id={elementId} style={containerStyle}>
      {/* 1. Header: Company Letterhead & Document Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2563eb', paddingBottom: '20px', marginBottom: '25px' }}>
        <div style={{ maxWidth: '50%', textAlign: 'left' }}>
          {companySettings?.logo && (
            <img 
              src={companySettings.logo} 
              alt="Company Logo" 
              style={{ maxHeight: '60px', maxWidth: '200px', objectFit: 'contain', marginBottom: '10px', display: 'block' }} 
            />
          )}
          <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#111827', fontWeight: 'bold' }}>
            {companySettings?.company_name || 'My Company'}
          </h2>
          {companySettings?.tax_registration_no && (
            <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#6b7280' }}>
              UEN / Tax Reg: {companySettings.tax_registration_no}
            </p>
          )}
          {companySettings?.registered_address && (
            <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#6b7280', whiteSpace: 'pre-line' }}>
              {companySettings.registered_address}
            </p>
          )}
          {(companySettings?.phone || companySettings?.email) && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
              {companySettings?.phone && `Tel: ${companySettings.phone}`} {companySettings?.email && `| ${companySettings.email}`}
            </p>
          )}
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
            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>
              Ref PO #: {invoice.po_number}
            </p>
          )}
          {creditTerms && (
            <p style={{ margin: '0', fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>
              Payment Terms: {creditTerms}
            </p>
          )}
        </div>
      </div>

      {/* 2. Customer Address Grid (Billed To & Shipped To) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '6px', textAlign: 'left' }}>
        <div>
          <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Billed To:
          </p>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#111827', fontWeight: 'bold' }}>
            {customerName}
          </h4>
          {billingAddress ? (
            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#4b5563', whiteSpace: 'pre-line' }}>
              {billingAddress}
            </p>
          ) : (
            <p style={{ margin: '0', fontSize: '12px', color: '#9ca3af', italic: 'true' }}>No billing address provided</p>
          )}
          {(customerPhone || customerEmail) && (
            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
              {customerPhone && `Tel: ${customerPhone}`} {customerEmail && `| ${customerEmail}`}
            </p>
          )}
        </div>

        <div>
          <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Shipped To:
          </p>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#111827', fontWeight: 'bold' }}>
            {invoice.shipping_name || customerName}
          </h4>
          {shippingAddress ? (
            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#4b5563', whiteSpace: 'pre-line' }}>
              {shippingAddress}
            </p>
          ) : (
            <p style={{ margin: '0', fontSize: '12px', color: '#9ca3af', italic: 'true' }}>Same as billing address</p>
          )}
        </div>
      </div>

      {/* 3. Line Items Table with Index Column */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ ...tableHeaderStyle, textAlign: 'center', width: '8%' }}>No.</th>
            <th style={{ ...tableHeaderStyle, textAlign: 'left', width: '44%' }}>Description</th>
            <th style={{ ...tableHeaderStyle, textAlign: 'center', width: '14%' }}>Quantity</th>
            <th style={{ ...tableHeaderStyle, textAlign: 'right', width: '17%' }}>Unit Price ($)</th>
            <th style={{ ...tableHeaderStyle, textAlign: 'right', width: '17%' }}>Total Amount ($)</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item, idx) => {
              const qty = Number(item.qty || item.quantity || 1);
              const price = Number(item.unitPrice || item.unit_price || 0);
              const itemTotal = qty * price;

              return (
                <tr key={idx}>
                  <td style={{ ...tableCellStyle, textAlign: 'center', color: '#6b7280', fontWeight: '600' }}>
                    {idx + 1}.
                  </td>
                  <td style={{ ...tableCellStyle, textAlign: 'left', wordBreak: 'break-word' }}>
                    {item.description || '—'}
                  </td>
                  <td style={{ ...tableCellStyle, textAlign: 'center' }}>{qty}</td>
                  <td style={{ ...tableCellStyle, textAlign: 'right' }}>{price.toFixed(2)}</td>
                  <td style={{ ...tableCellStyle, textAlign: 'right', fontWeight: '500' }}>{itemTotal.toFixed(2)}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" style={{ ...tableCellStyle, textAlign: 'center', color: '#9ca3af' }}>No line items recorded.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 4. Total Summary */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '25px' }}>
        <div style={{ width: '260px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #111827', fontWeight: 'bold', fontSize: '15px' }}>
            <span>Grand Total (SGD):</span>
            <span style={{ color: '#2563eb' }}>${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 5. Relocated Remarks / Special Instructions Section */}
      {invoice.remarks && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: '#fffbe8', border: '1px solid #fef3c7', borderRadius: '6px', textAlign: 'left' }}>
          <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', textTransform: 'uppercase', color: '#b45309', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            📝 Remarks / Special Instructions
          </h5>
          <p style={{ margin: 0, fontSize: '12px', color: '#78350f', whiteSpace: 'pre-line' }}>
            {invoice.remarks}
          </p>
        </div>
      )}

      {/* 6. Banking & Payment Footer */}
      {(companySettings?.bank_name || companySettings?.paynow_uen) && (
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '15px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '6px', textAlign: 'left' }}>
          <h5 style={{ margin: '0 0 8px 0', fontSize: '11px', textTransform: 'uppercase', color: '#334155', fontWeight: 'bold', letterSpacing: '0.5px' }}>
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