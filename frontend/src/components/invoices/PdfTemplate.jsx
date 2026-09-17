import React from 'react';

export const InvoicePdfTemplate = ({ invoice, companySettings }) => {
  return (
    <div className="pdf-container p-8 text-slate-800 bg-white border border-slate-200 rounded-lg max-w-4xl mx-auto font-sans">
      {/* Header / Company Letterhead */}
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div>
          {companySettings?.logo ? (
            <img
              src={companySettings.logo}
              alt="Company Logo"
              className="h-16 w-auto mb-3 object-contain"
            />
          ) : (
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {companySettings?.company_name || 'My Company'}
            </h1>
          )}
          <p className="text-sm text-slate-500">
            <span className="font-semibold">Tax / UEN:</span> {companySettings?.tax_registration_no || 'N/A'}
          </p>
          <p className="text-sm text-slate-500 whitespace-pre-line mt-1">
            {companySettings?.registered_address || 'Company Address'}
          </p>
        </div>

        <div className="text-right">
          <h2 className="text-3xl font-extrabold text-slate-900 uppercase tracking-wide">INVOICE</h2>
          <p className="text-sm text-slate-600 mt-2">
            <span className="font-semibold">Invoice #:</span> {invoice?.invoice_number || 'INV-001'}
          </p>
          <p className="text-sm text-slate-600">
            <span className="font-semibold">Date:</span> {invoice?.date || new Date().toLocaleDateString()}
          </p>
          <p className="text-sm text-slate-600">
            <span className="font-semibold">Due Date:</span> {invoice?.due_date || 'Upon Receipt'}
          </p>
        </div>
      </div>

      {/* Bill To Section */}
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Billed To:</h3>
        <p className="text-base font-semibold text-slate-800">{invoice?.client_name || 'Client Name'}</p>
        <p className="text-sm text-slate-500 whitespace-pre-line">{invoice?.client_address || 'Client Address'}</p>
        {invoice?.client_email && (
          <p className="text-sm text-slate-500 mt-1">{invoice.client_email}</p>
        )}
      </div>

      {/* Line Items Table */}
      <table className="w-full text-left border-collapse mb-8">
        <thead>
          <tr className="border-b-2 border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3 px-2">Description</th>
            <th className="py-3 px-2 text-center">Qty</th>
            <th className="py-3 px-2 text-right">Unit Price</th>
            <th className="py-3 px-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
          {invoice?.items && invoice.items.length > 0 ? (
            invoice.items.map((item, index) => (
              <tr key={index}>
                <td className="py-3 px-2 font-medium">{item.description}</td>
                <td className="py-3 px-2 text-center">{item.quantity}</td>
                <td className="py-3 px-2 text-right">${Number(item.unit_price).toFixed(2)}</td>
                <td className="py-3 px-2 text-right font-semibold">${(item.quantity * item.unit_price).toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="py-4 text-center text-slate-400 italic">
                No line items added.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Financial Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2 text-sm text-slate-600">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Subtotal:</span>
            <span className="font-semibold">${Number(invoice?.subtotal || invoice?.total_amount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Tax:</span>
            <span className="font-semibold">${Number(invoice?.tax_amount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-base font-bold text-slate-900 border-b-2 border-slate-900">
            <span>Total Due:</span>
            <span>${Number(invoice?.total_amount || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer / Banking & Payment Instructions */}
      <div className="mt-8 pt-4 border-t border-slate-200 text-left">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Payment Instructions</h3>
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg text-slate-600">
          <div>
            <p><strong>Bank Name:</strong> {companySettings?.bank_name || 'N/A'}</p>
            <p><strong>Account Name:</strong> {companySettings?.account_name || 'N/A'}</p>
            <p><strong>Account Number:</strong> {companySettings?.account_number || 'N/A'}</p>
          </div>
          <div>
            <p><strong>SWIFT / BIC:</strong> {companySettings?.swift_code || 'N/A'}</p>
            <p><strong>PayNow UEN:</strong> {companySettings?.paynow_uen || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};