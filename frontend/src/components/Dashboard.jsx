import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
    const [metrics, setMetrics] = useState({
      totalSpend: 0,
      pendingMatches: 0,
      discrepancyCount: 0,
    });
    const navigate = useNavigate();
    const [discrepancies, setDiscrepancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [formData, setFormData] = useState({first_name: '', last_name: '', email: '',});

    useEffect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
          });
        } catch (e) {
          console.error(e);
        }
      }
    }, []);

    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);

      if (onLogout) {
        onLogout(); // Triggers handleLogout in App.jsx
      }// <-- Crucial: resetting state triggers re-render back to <Login />
    };
    const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      // Call DRF endpoint to update profile details
      const response = await api.patch(`/api/users/${currentUser.id}/`, formData);
      setCurrentUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setIsProfileModalOpen(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile.');
    }
    }
    // Format full name with fallback to username or default string
    const getUserDisplayName = () => {
      if (!currentUser) return 'User';
      const fullName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();
      return fullName || currentUser.username || 'User';
    };
    return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        textAlign: 'left', 
        marginBottom: '24px', 
        color: '#111827' 
      }}>
      Welcome back, {getUserDisplayName()}!
      </h1>
      
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
      👤 {currentUser?.username || 'Account'} ▾
      </button>

    {isMenuOpen && (
      <div style={{
        position: 'absolute',
        top: '100%',     // Positions directly below button
        left: 0,         // Aligns with the left edge of the button
        marginTop: '6px',
        width: '180px',
        background: '#FFF',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        zIndex: 50
      }}>
      
      <button onClick={() => { setIsProfileModalOpen(true); setIsMenuOpen(false); }}>
        ✏️ Edit Profile
      </button>
      <button onClick={handleLogout} style={{ cursor: 'pointer', color: '#EF4444' }}>
        Log Out
      </button>
    </div>
  )}
</div>
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

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#FFF', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.25rem', color: '#111827' }}>Update Personal Info</h3>

            <form onSubmit={handleProfileSave}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>First Name</label>
                <input 
                  type="text" 
                  value={formData.first_name} 
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px' }} 
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Last Name</label>
                <input 
                  type="text" 
                  value={formData.last_name} 
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px' }} 
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsProfileModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#E5E7EB', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '8px 16px', background: '#2563EB', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}