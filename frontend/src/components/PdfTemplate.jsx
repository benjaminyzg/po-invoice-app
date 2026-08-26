// PdfTemplate.jsx
import { QRCodeSVG } from 'qrcode.react';
import { generatePayNowPayload } from '../utils/paynow';

export const InvoicePdfTemplate = ({ invoice, companySettings }) => {
  const uenNumber = companySettings?.uen || "201912345A"; // Fallback UEN
  
  const paynowPayload = generatePayNowPayload({
    uen: uenNumber,
    amount: invoice?.total_amount,
    refNumber: invoice?.invoice_number,
    companyName: companySettings?.name || "My Company Pte Ltd"
  });
return (
  <div className="pdf-container p-8 text-slate-800">
    
    {/* 1. HEADER / COMPANY LETTERHEAD */}
    <div className="flex justify-between items-start border-b pb-6 mb-6">
      
      {/* Left Column: Company Branding */}
      <div className="text-left">
        {companySettings?.logo && (
          <img
            src={companySettings.logo}
            alt="Company Logo"
            className="h-24 w-auto mb-3 object-contain"
          />
        )}
        <h1 className="text-2xl font-bold">{companySettings?.company_name || 'My Company'}</h1>
        <p className="text-sm text-slate-500">
          Tax / UEN: {companySettings?.paynow_uen || companySettings?.tax_registration_no || companySettings?.uen || '-'}
        </p>
        {companySettings?.registered_address && (
          <p className="text-sm text-slate-500 whitespace-pre-line mt-1">
            {companySettings.registered_address}
          </p>
        )}
      </div>

      {/* Right Column: Contact Details */}
      <div className="text-right text-sm text-slate-600 space-y-1">
        <p><strong>Phone:</strong> {companySettings?.phone || '-'}</p>
        <p><strong>Email:</strong> {companySettings?.email || '-'}</p>
        <p><strong>Web:</strong> {companySettings?.website || '-'}</p>
      </div>
    </div>

    {/* 2. INVOICE META & LINE ITEMS PLACEHOLDER */}
    {/* ... Your invoice details table goes here ... */}

    {/* 3. UNIFIED FOOTER: PAYMENT INSTRUCTIONS & PAYNOW QR */}
    <div className="mt-8 pt-4 border-t border-slate-200 text-left">
      <h3 className="text-md font-semibold text-slate-700 mb-3">Payment Instructions</h3>
      <div className="grid grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-lg items-center">
        {/* SWIFT / Bank Details (2 Columns wide) */}
        <div className="col-span-2 grid grid-cols-2 gap-2">
          <div>
            <p><strong>Bank Name:</strong> {companySettings?.bank_name || 'DBS Bank Ltd'}</p>
            <p><strong>Account Name:</strong> {companySettings?.account_name || companySettings?.company_name || 'My Company'}</p>
            <p><strong>Account Number:</strong> {companySettings?.account_number || '012-345678-9'}</p>
          </div>
          <div>
            <p><strong>SWIFT / BIC:</strong> {companySettings?.swift_code || 'DBSSSGSG'}</p>
            <p><strong>PayNow UEN:</strong> {companySettings?.paynow_uen || companySettings?.tax_registration_no || '-'}</p>
          </div>
        </div>

        {/* PayNow Corporate QR Code (1 Column wide) */}
        {paynowPayload && (
          <div className="border-l border-slate-200 pl-4 flex flex-col items-center justify-center text-center">
            <QRCodeSVG value={paynowPayload} size={90} level="M" />
            <p className="text-xs font-bold mt-2 text-slate-700">Scan to Pay via PayNow Corporate</p>
            <p className="text-[10px] text-slate-500">
              UEN: {companySettings?.paynow_uen || companySettings?.tax_registration_no || '-'}
            </p>
          </div>
        )}
      </div>
    </div>

  </div>
);
};