import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { InvoicePdfTemplate } from '../PdfTemplate';

export const InvoicePreview = ({ invoice, companySettings, onClose }) => {
  // 1. Create reference for the DOM element to export
  const pdfRef = useRef(null);

  // 2. Define the PDF export handler
  const handleDownloadPdf = () => {
    const element = pdfRef.current; 
    const options = {
      margin:       0.5,
      filename:     `Invoice_${invoice?.invoice_number || 'draft'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true }, // useCORS allows backend media logo loading
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      {/* Control Bar */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">Invoice Preview</h2>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPdf}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Download PDF
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
          <button 
            onClick={() => window.open(`http://127.0.0.1:8000/api/invoices/${invoice.id}/export-invoice-pdf/`, '_blank')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            📄 Commercial Invoice PDF
          </button>

          <button 
            onClick={() => window.open(`http://127.0.0.1:8000/api/invoices/${invoice.id}/export-do-pdf/`, '_blank')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            🚚 Delivery Order PDF
          </button>

          <button 
            onClick={() => window.open(`http://127.0.0.1:8000/api/invoices/${invoice.id}/export-packing-pdf/`, '_blank')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            📦 Packing List PDF
          </button>
        </div>
      </div>

      {/* 3. Attach pdfRef to the printable container */}
      <div ref={pdfRef}>
        <InvoicePdfTemplate invoice={invoice} companySettings={companySettings} />
      </div>
    </div>
  );
};