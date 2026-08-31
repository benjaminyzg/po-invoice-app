import React from 'react';
import html2pdf from 'html2pdf.js';

export default function ExportPdfButton({ documentData, type = 'INVOICE' }) {
  const handleExport = () => {
    const isInvoice = type === 'INVOICE';
    const docNumber = documentData?.invoice_number || documentData?.po_number || 'DOCUMENT';
    
    // Build temporary DOM container for clean PDF rendering
    const element = document.createElement('div');
    element.style.padding = '30px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.color = '#333';

    element.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px;">
        <div>
          <h1 style="margin: 0; color: #1e3a8a; font-size: 24px;">ACME Enterprise Ltd</h1>
          <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 12px;">Tax / UEN: 202612345R | support@acme.com</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; color: #2563eb; font-size: 20px;">${isInvoice ? 'INVOICE' : 'PURCHASE ORDER'}</h2>
          <p style="margin: 4px 0 0 0; font-weight: bold; font-size: 14px;">#${docNumber}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 13px;">
        <div>
          <strong style="color: #374151;">Billed To:</strong><br />
          ${documentData?.vendor_name || 'Vendor / Client Name'}<br />
          Issued Date: ${documentData?.issued_date || 'N/A'}<br />
          Due Date: ${documentData?.due_date || 'N/A'}
        </div>
        <div style="text-align: right;">
          <strong style="color: #374151;">Payment Details:</strong><br />
          Status: <span style="font-weight: bold; color: ${documentData?.status === 'PAID' ? '#16a34a' : '#dc2626'};">${documentData?.status || 'PENDING'}</span><br />
          PO Reference: ${documentData?.po_number || 'N/A'}
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px;">
        <thead>
          <tr style="background-color: #f3f4f6; text-align: left; border-bottom: 1px solid #d1d5db;">
            <th style="padding: 10px;">Item Description</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Unit Price</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${(documentData?.items || []).map(item => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px;">${item.description}</td>
              <td style="padding: 10px; text-align: center;">${item.qty || item.quantity}</td>
              <td style="padding: 10px; text-align: right;">$${Number(item.unitPrice || item.unit_price).toFixed(2)}</td>
              <td style="padding: 10px; text-align: right;">$${(Number(item.qty || item.quantity) * Number(item.unitPrice || item.unit_price)).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
        <div style="width: 250px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
            <span>Subtotal:</span>
            <span>$${Number(documentData?.total_amount || 0).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; font-weight: bold; font-size: 15px; color: #1e3a8a;">
            <span>Total Amount:</span>
            <span>$${Number(documentData?.total_amount || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;

    const options = {
      margin: 10,
      filename: `${type}_${docNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(options).from(element).save();
  };

  return (
    <button
      onClick={handleExport}
      style={{
        backgroundColor: '#4f46e5',
        color: '#fff',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
      }}
    >
      📄 Export PDF
    </button>
  );
}