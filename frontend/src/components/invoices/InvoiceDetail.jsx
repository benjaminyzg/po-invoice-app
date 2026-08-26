import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InvoicePreview } from './InvoicePreview';

export const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState(null);
  const [companySettings, setCompanySettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoiceRes, settingsRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/invoices/${id}/`),
          fetch('http://127.0.0.1:8000/api/company-settings/1/')
        ]);

        if (invoiceRes.ok) setInvoice(await invoiceRes.json());
        if (settingsRes.ok) setCompanySettings(await settingsRes.json());
      } catch (error) {
        console.error('Error loading invoice details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleMarkAsPaid = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/invoices/${id}/mark-paid/`, { method: 'PATCH' });
      if (res.ok) {
        setInvoice((prev) => ({ ...prev, status: 'paid' }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) return <div className="p-6 text-slate-500">Loading invoice details...</div>;
  if (!invoice) return <div className="p-6 text-red-500">Invoice not found.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <button 
            onClick={() => navigate('/invoices')} 
            className="text-sm text-blue-600 hover:underline mb-2 block"
          >
            ← Back to Invoices
          </button>
          <h1 className="text-2xl font-bold">Invoice #{invoice.invoice_number}</h1>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
            invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {(invoice.status || 'draft').toUpperCase()}
          </span>
        </div>

        <div className="flex gap-3">
          {invoice.status !== 'paid' && (
            <button
              onClick={handleMarkAsPaid}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Mark as Paid
            </button>
          )}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {showPreview ? 'Hide Preview' : 'Preview & Print PDF'}
          </button>
        </div>
      </div>

      {/* Embedded PDF Preview */}
      {showPreview && (
        <div className="mt-6 border-t pt-6">
          <InvoicePreview 
            invoice={invoice} 
            companySettings={companySettings} 
            onClose={() => setShowPreview(false)} 
          />
        </div>
      )}
    </div>
  );
};