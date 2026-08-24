// PdfTemplate.jsx

export const InvoicePdfTemplate = ({ invoice, companySettings }) => {
  return (
    <div className="pdf-container p-8 text-slate-800">
      {/* Header / Company Letterhead */}
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div>
          {companySettings?.logo && (
            <img 
              src={companySettings.logo} 
              alt="Company Logo" 
              className="h-16 w-auto mb-3 object-contain"
            />
          )}
          <h1 className="text-xl font-bold text-left">{companySettings?.company_name || 'My Company'}</h1>
          <p className="text-sm text-slate-500 text-left">Tax / UEN: {companySettings?.tax_registration_no}</p>
          <p className="text-sm text-slate-500 whitespace-pre-line text-left">{companySettings?.registered_address}</p>
        </div>

        <div className="text-right text-sm text-slate-600">
          <p><strong>Phone:</strong> {companySettings?.phone}</p>
          <p><strong>Email:</strong> {companySettings?.email}</p>
          <p><strong>Web:</strong> {companySettings?.website}</p>
        </div>
      </div>

      {/* Line Items & Invoice Body Here */}
      {/* ... */}

      {/* Footer / Banking & Payment Instructions */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-left">
        <h3 className="text-md font-semibold text-slate-700 mb-2 text-left">Payment Instructions</h3>
        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg text-left">
            <div className="text-left">
            <p><strong>Bank Name:</strong> {companySettings?.bank_name}</p>
            <p><strong>Account Name:</strong> {companySettings?.account_name}</p>
            <p><strong>Account Number:</strong> {companySettings?.account_number}</p>
            </div>
            <div className="text-left">
            <p><strong>SWIFT / BIC:</strong> {companySettings?.swift_code}</p>
            <p><strong>PayNow UEN:</strong> {companySettings?.paynow_uen}</p>
            </div>
        </div>
        </div>
    </div>
  );
};