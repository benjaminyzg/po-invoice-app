import React, { useEffect, useState } from 'react';
import Login from './Login';
import POList from './components/POList';
import Invoices from './components/invoices/Invoices';
import PurchaseOrders from './components/purchase-orders/PurchaseOrders';
import PurchaseOrderList from './components/PurchaseOrderList';
import CatalogItems from './components/CatalogItems';
import Settings from './components/settings/Settings';
import Dashboard from './components/Dashboard';
import UsersAdmin from './components/UsersAdmin';
import './App.css'; 

const BASE_URL = 'http://127.0.0.1:8000/api';

export default function App() {
  // Read initial token state directly from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  // const [activeTab, setActiveTab] = useState('invoices');
  const [activeTab, setActiveTab] = useState('dashboard'); // Set as default landing view
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(''); // Reset React state to render Login component
  };
  // If no token exists, render the Login screen
  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={{ fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal' }}
        >
          📊 Dashboard
        </button>
        <button onClick={() => setActiveTab('invoices')} style={{ padding: '8px 16px', fontWeight: activeTab === 'invoices' ? 'bold' : 'normal' }}>
          📄 Invoices Records
        </button>
        <button onClick={() => setActiveTab('purchaseOrders')} style={{ padding: '8px 16px', fontWeight: activeTab === 'purchaseOrders' ? 'bold' : 'normal' }}>
          📦 Purchase Orders
        </button>
        <button onClick={() => setActiveTab('catalog')} style={{ padding: '8px 16px', fontWeight: activeTab === 'catalog' ? 'bold' : 'normal' }}>
          🏷️ Catalog Items
        </button>
        <button onClick={() => setActiveTab('settings')} style={{ padding: '8px 16px', fontWeight: activeTab === 'settings' ? 'bold' : 'normal' }}>
          ⚙️ Company Settings
        </button>
        <button onClick={() => setActiveTab('usersAdmin')} style={{ padding: '8px 16px', fontWeight: activeTab === 'usersAdmin' ? 'bold' : 'normal' }}>
          👥 Users Admin
        </button>
      </nav>

      {/* Tab Views */}
      <main>
        {activeTab === 'invoices' && (
          <Invoices token={token} baseUrl={BASE_URL} />
        )}
        {activeTab === 'purchaseOrders' && (
          <div>
            {/* 1. Form component for creating new POs */}
            <PurchaseOrders token={token} baseUrl={BASE_URL} />
            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #ddd' }} />
          </div>
        )}
        {/* Tab Views */}
        {/* Inside your main App return statement */}
        {activeTab === 'catalog' && (
          <CatalogItems token={token} baseUrl="http://localhost:8000/api" />
        )}
        {activeTab === 'settings' && (
          <Settings token={token} baseUrl={BASE_URL} />
        )}

        {/*} In your Main Content Area: */}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'invoices' && <Invoices />}
        {/* Other existing tab components */}
        {activeTab === 'usersAdmin' && (
          <UsersAdmin token={token} baseUrl={BASE_URL} />
        )}
      </main>
    </div>
  );
}


