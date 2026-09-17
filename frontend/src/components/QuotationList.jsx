import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function QuotationList({ onEditQuotation, refreshKey }) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState(null); // For Preview Modal

  useEffect(() => {
    fetchQuotations();
  }, [refreshKey]);

  const fetchQuotations = async () => {
    try {
        const response = await axios.get('/api/quotations/');
        // Handle both flat array responses and Django DRF paginated responses ({ results: [...] })
        const dataArray = Array.isArray(response.data) 
        ? response.data 
        : (response.data.results || []);
        setQuotations(dataArray);
    } catch (error) {
        console.error('Error fetching quotation records:', error);
        setQuotations([]); // Fallback to empty array on error
    } finally {
        setLoading(false);
    }
  };
  const handleDelete = async (id, ref) => {
    if (window.confirm(`Are you sure you want to delete quotation ${ref}?`)) {
      try {
        await axios.delete(`/api/quotations/${id}/`);
        setQuotations(quotations.filter((q) => q.id !== id));
      } catch (error) {
        console.error('Error deleting quotation:', error);
        alert('Failed to delete quotation.');
      }
    }
  };
  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading historical records...</div>;

  return (
    <div style={{ marginTop: '40px', borderTop: '2px solid #e2e8f0', paddingTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748' }}>Quotation Historical Records</h3>
        <button
          type="button"
          onClick={fetchQuotations}
          style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px', border: '1px solid #cbd5e0', cursor: 'pointer' }}
        >
          🔄 Refresh List
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
        <thead>
          <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
            <th style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold' }}>REF NO.</th>
            <th style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold' }}>ENTITY NAME</th>
            <th style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold' }}>CONTACT</th>
            <th style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold' }}>VALIDITY</th>
            <th style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold' }}>INCOTERM</th>
            <th style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
            {!Array.isArray(quotations) || quotations.length === 0 ? (
                <tr>
                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#a0aec0' }}>
                    No historical quotations found.
                </td>
                </tr>
            ) : (
                quotations.map((q) => (
                <tr key={q.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                    {/* Table cell renders... */}
                </tr>
                ))
            )}
        </tbody>
      </table>

      {/* --- PREVIEW MODAL --- */}
      {selectedQuotation && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', width: '600px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', pb: '12px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Quotation Preview ({selectedQuotation.quotation_ref})</h2>
              <button onClick={() => setSelectedQuotation(null)} style={{ border: 'none', background: 'none', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', marginBottom: '16px' }}>
              <div><strong>Entity Name:</strong> {selectedQuotation.entity_name}</div>
              <div><strong>Contact Person:</strong> {selectedQuotation.contact_person}</div>
              <div><strong>Contact Email:</strong> {selectedQuotation.contact_email}</div>
              <div><strong>Mobile / Office:</strong> {selectedQuotation.mobile_number || '-'} / {selectedQuotation.office_number || '-'}</div>
              <div><strong>Address:</strong> {selectedQuotation.entity_address} ({selectedQuotation.entity_postal_code})</div>
              <div><strong>Country of Origin:</strong> {selectedQuotation.country_of_origin || 'Singapore'}</div>
              <div><strong>Incoterm:</strong> {selectedQuotation.incoterm || '-'}</div>
              <div><strong>Payment Term:</strong> {selectedQuotation.payment_term}</div>
              <div><strong>Validity:</strong> {selectedQuotation.validity_of_quotation}</div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Line Items</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', fontSize: '13px', marginBottom: '16px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc' }}>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(selectedQuotation.items || []).map((item, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid #edf2f7' }}>
                    <td style={{ padding: '6px' }}>{item.description}</td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>${parseFloat(item.unit_price).toFixed(2)}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>${(item.quantity * item.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedQuotation.remarks && (
              <div style={{ fontSize: '13px', marginBottom: '16px' }}>
                <strong>Remarks:</strong> {selectedQuotation.remarks}
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setSelectedQuotation(null)}
                style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#2d3748', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Close / Cancel
              </button>

              {/* Export PDF Button */}
							<button
							type="button"
							onClick={() => window.open(`/api/quotations/${q.id}/export-pdf/`, '_blank')}
							style={{
									padding: '4px 8px',
									fontSize: '12px',
									backgroundColor: '#e6fffa',
									color: '#234e52',
									border: '1px solid #b2f5ea',
									borderRadius: '4px',
									cursor: 'pointer'
							}}
							>
							PDF
							</button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}