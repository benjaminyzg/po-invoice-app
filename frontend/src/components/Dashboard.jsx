import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalSpend: 0,
    pendingMatches: 0,
    discrepancyCount: 0,
  });
  const [discrepancies, setDiscrepancies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [invoicesRes, posRes] = await Promise.all([
          api.get('/invoices/'),
          api.get('/purchase-orders/'),
        ]);

        const invoices = invoicesRes.data || [];
        const pos = posRes.data || [];

        // Compute KPIs
        const totalSpend = invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
        const pendingMatches = invoices.filter(inv => inv.status === 'PENDING' || inv.status === 'UNMATCHED').length;
        
        // Filter flagged discrepancies
        const flagged = invoices.filter(inv => inv.status === 'DISCREPANCY' || inv.has_variance);

        setMetrics({
          totalSpend,
          pendingMatches,
          discrepancyCount: flagged.length,
        });
        setDiscrepancies(flagged);
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Analytics & Alerts...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '1e293b' }}>Executive Spend & Matching Analytics</h2>

      {/* KPI Cards Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>TOTAL MONTHLY SPEND</span>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', color: '#0f172a' }}>
            ${metrics.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #f59e0b', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>PENDING 3-WAY MATCHES</span>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', color: '#0f172a' }}>{metrics.pendingMatches}</h3>
        </div>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ef4444', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>FLAGGED DISCREPANCIES</span>
          <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', color: '#dc2626' }}>{metrics.discrepancyCount}</h3>
        </div>
      </div>

      {/* Discrepancies Alert Board */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#991b1b', fontSize: '16px' }}>🚨 Active Mismatch Alerts</h3>
          <span style={{ fontSize: '12px', background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
            Requires Attention ({discrepancies.length})
          </span>
        </div>

        {discrepancies.length === 0 ? (
          <p style={{ color: '#16a34a', fontSize: '14px', margin: 0 }}>✓ No pricing or quantity variances detected across active invoices.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Invoice #</th>
                <th style={{ padding: '10px' }}>PO Reference</th>
                <th style={{ padding: '10px' }}>Vendor</th>
                <th style={{ padding: '10px' }}>Total Amount</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {discrepancies.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{inv.invoice_number}</td>
                  <td style={{ padding: '10px' }}>{inv.po_number || 'N/A'}</td>
                  <td style={{ padding: '10px' }}>{inv.vendor_name}</td>
                  <td style={{ padding: '10px' }}>${Number(inv.total_amount).toFixed(2)}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ color: '#dc2626', fontWeight: 'bold', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}