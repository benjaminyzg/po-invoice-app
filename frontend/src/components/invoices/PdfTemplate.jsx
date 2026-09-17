import React from 'react';

export default function InvoicePdfTemplate({ invoice, companySettings }) {
  return (
    <div id="printable-invoice" style={{ padding: '24px', background: '#fff', color: '#000', fontFamily: 'Arial, sans-serif' }}>
      
      {/* 1. Company Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
            {companySettings?.company_name || 'My Company'}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
            Tax / UEN: {companySettings?.tax_uen || '-'}
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px' }}>
          <p style={{ margin: '2px 0' }}>Phone: {companySettings?.phone || '-'}</p>
          <p style={{ margin: '2px 0' }}>Email: {companySettings?.email || '-'}</p>
          <p style={{ margin: '2px 0' }}>Web: {companySettings?.web || '-'}</p>
        </div>
      </div>

      {/* 2. Payment Instructions Box */}
      <div style={{ border: '1px solid #ccc', padding: '16px', marginBottom: '20px', borderRadius: '4px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>Payment Instructions</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <div>
            <p style={{ margin: '4px 0' }}><strong>Bank Name:</strong> {companySettings?.bank_name || '-'}</p>
            <p style={{ margin: '4px 0' }}><strong>Account Name:</strong> {companySettings?.account_name || '-'}</p>
            <p style={{ margin: '4px 0' }}><strong>Account Number:</strong> {companySettings?.account_number || '-'}</p>
          </div>
          <div>
            <p style={{ margin: '4px 0' }}><strong>SWIFT / BIC:</strong> {companySettings?.swift_bic || '-'}</p>
            <p style={{ margin: '4px 0' }}><strong>PayNow UEN:</strong> {companySettings?.paynow_uen || '-'}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            {companySettings?.qr_code_image ? (
              <img src={companySettings.qr_code_image} alt="PayNow QR" style={{ width: '80px', height: '80px' }} />
            ) : (
              <div style={{ width: '80px', height: '80px', border: '1px dashed #999', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#666' }}>QR Code</div>
            )}
            <p style={{ margin: '4px 0 0', fontSize: '10px' }}>Scan to Pay via PayNow Corporate</p>
          </div>
        </div>
      </div>

      {/* Invoice Data / Line Items area */}
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

// export const InvoicePdfTemplate = ({ invoice, companySettings }) => {
//   return (
//     <div className="pdf-container p-8 text-slate-800 bg-white border border-slate-200 rounded-lg max-w-4xl mx-auto font-sans">
//       {/* Header / Company Letterhead */}
//       <div className="flex justify-between items-start border-b pb-6 mb-6">
//         <div>
//           {companySettings?.logo ? (
//             <img
//               src={companySettings.logo}
//               alt="Company Logo"
//               className="h-16 w-auto mb-3 object-contain"
//             />
//           ) : (
//             <h1 className="text-2xl font-bold text-slate-900 mb-1">
//               {companySettings?.company_name || 'My Company'}
//             </h1>
//           )}
//           <p className="text-sm text-slate-500">
//             <span className="font-semibold">Tax / UEN:</span> {companySettings?.tax_registration_no || 'N/A'}
//           </p>
//           <p className="text-sm text-slate-500 whitespace-pre-line mt-1">
//             {companySettings?.registered_address || 'Company Address'}
//           </p>
//         </div>

//         <div className="text-right">
//           <h2 className="text-3xl font-extrabold text-slate-900 uppercase tracking-wide">INVOICE</h2>
//           <p className="text-sm text-slate-600 mt-2">
//             <span className="font-semibold">Invoice #:</span> {invoice?.invoice_number || 'INV-001'}
//           </p>
//           <p className="text-sm text-slate-600">
//             <span className="font-semibold">Date:</span> {invoice?.date || new Date().toLocaleDateString()}
//           </p>
//           <p className="text-sm text-slate-600">
//             <span className="font-semibold">Due Date:</span> {invoice?.due_date || 'Upon Receipt'}
//           </p>
//         </div>
//       </div>

//       {/* Bill To Section */}
//       <div className="mb-8">
//         <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Billed To:</h3>
//         <p className="text-base font-semibold text-slate-800">{invoice?.client_name || 'Client Name'}</p>
//         <p className="text-sm text-slate-500 whitespace-pre-line">{invoice?.client_address || 'Client Address'}</p>
//         {invoice?.client_email && (
//           <p className="text-sm text-slate-500 mt-1">{invoice.client_email}</p>
//         )}
//       </div>

//       {/* Line Items Table */}
//       <table className="w-full text-left border-collapse mb-8">
//         <thead>
//           <tr className="border-b-2 border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
//             <th className="py-3 px-2">Description</th>
//             <th className="py-3 px-2 text-center">Qty</th>
//             <th className="py-3 px-2 text-right">Unit Price</th>
//             <th className="py-3 px-2 text-right">Total</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
//           {invoice?.items && invoice.items.length > 0 ? (
//             invoice.items.map((item, index) => (
//               <tr key={index}>
//                 <td className="py-3 px-2 font-medium">{item.description}</td>
//                 <td className="py-3 px-2 text-center">{item.quantity}</td>
//                 <td className="py-3 px-2 text-right">${Number(item.unit_price).toFixed(2)}</td>
//                 <td className="py-3 px-2 text-right font-semibold">${(item.quantity * item.unit_price).toFixed(2)}</td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="4" className="py-4 text-center text-slate-400 italic">
//                 No line items added.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {/* Financial Summary */}
//       <div className="flex justify-end mb-8">
//         <div className="w-64 space-y-2 text-sm text-slate-600">
//           <div className="flex justify-between py-1 border-b border-slate-100">
//             <span>Subtotal:</span>
//             <span className="font-semibold">${Number(invoice?.subtotal || invoice?.total_amount || 0).toFixed(2)}</span>
//           </div>
//           <div className="flex justify-between py-1 border-b border-slate-100">
//             <span>Tax:</span>
//             <span className="font-semibold">${Number(invoice?.tax_amount || 0).toFixed(2)}</span>
//           </div>
//           <div className="flex justify-between py-2 text-base font-bold text-slate-900 border-b-2 border-slate-900">
//             <span>Total Due:</span>
//             <span>${Number(invoice?.total_amount || 0).toFixed(2)}</span>
//           </div>
//         </div>
//       </div>

//       {/* Footer / Banking & Payment Instructions */}
//       <div className="mt-8 pt-4 border-t border-slate-200 text-left">
//         <h3 className="text-sm font-semibold text-slate-700 mb-2">Payment Instructions</h3>
//         <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg text-slate-600">
//           <div>
//             <p><strong>Bank Name:</strong> {companySettings?.bank_name || 'N/A'}</p>
//             <p><strong>Account Name:</strong> {companySettings?.account_name || 'N/A'}</p>
//             <p><strong>Account Number:</strong> {companySettings?.account_number || 'N/A'}</p>
//           </div>
//           <div>
//             <p><strong>SWIFT / BIC:</strong> {companySettings?.swift_code || 'N/A'}</p>
//             <p><strong>PayNow UEN:</strong> {companySettings?.paynow_uen || 'N/A'}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };