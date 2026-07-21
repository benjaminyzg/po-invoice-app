import React, { useState } from 'react';
import Login from './Login';
import Invoices from './components/Invoices';
import PurchaseOrders from './components/PurchaseOrders';
import CatalogItems from './components/CatalogItems';

const BASE_URL = 'http://127.0.0.1:8000/api';

export default function App() {
  // Read initial token state directly from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [activeTab, setActiveTab] = useState('invoices');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(''); // Reset React state to render Login component
  };

  // If no token exists, render the Login screen
  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>PO & Invoice Management Portal</h2>
        <button 
          onClick={handleLogout} 
          style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <button onClick={() => setActiveTab('invoices')} style={{ padding: '8px 16px', fontWeight: activeTab === 'invoices' ? 'bold' : 'normal' }}>
          📄 Invoices
        </button>
        <button onClick={() => setActiveTab('purchaseOrders')} style={{ padding: '8px 16px', fontWeight: activeTab === 'purchaseOrders' ? 'bold' : 'normal' }}>
          📦 Purchase Orders
        </button>
        <button onClick={() => setActiveTab('catalog')} style={{ padding: '8px 16px', fontWeight: activeTab === 'catalog' ? 'bold' : 'normal' }}>
          🏷️ Catalog Items
        </button>
      </nav>

      {/* Tab Views */}
      <main>
        {activeTab === 'invoices' && <Invoices token={token} baseUrl={BASE_URL} />}
        {activeTab === 'purchaseOrders' && <PurchaseOrders token={token} baseUrl={BASE_URL} />}
        {activeTab === 'catalog' && <CatalogItems token={token} baseUrl={BASE_URL} />}
      </main>
    </div>
  );
}