import React, { useState, useEffect } from 'react';
import Login from './Login'; 
import AddInvoiceForm from './AddInvoiceForm';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const editInputStyle = {
    padding: '5px',
    backgroundColor: '#ffffff', // Sets the box to white
    color: '#000000',           // Sets text to black
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '90%'                // Ensures it fits nicely in the table cell
  };
  
  const saveEdit = (id) => {
  fetch(`http://127.0.0.1:8000/api/invoices/${id}/update/`, {
    method: 'PATCH',
    headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Token ${token}` },
    body: JSON.stringify(editData)
  }).then(() => { setEditingId(null); fetchInvoices(); });
  };

  const fetchInvoices = () => {
    if (!token) return;
    fetch('http://127.0.0.1:8000/api/invoices/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      }
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch invoices');
      return response.json();
    })
    .then(data => setInvoices(data))
    .catch(err => setError(err.message));
  };

  const deleteInvoice = (id) => {
  fetch(`http://127.0.0.1:8000/api/invoices/${id}/delete/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Token ${token}`
    }
    })
    .then(response => {
      if (response.ok) {
        fetchInvoices(); // Refresh the list after successful deletion
      }
    });
  };

  // Fetch invoices from backend when the component mounts or when token changes
  useEffect(() => {
    if (token) {
      fetch('http://127.0.0.1:8000/api/invoices/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}` // Sends your saved login token to Django
        }
      })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch invoices');
        return response.json();
      })
      .then(data => setInvoices(data))
      .catch(err => setError(err.message));
    }
  }, [token]);

  const handleLoginSuccess = () => setToken(localStorage.getItem('token'));
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setInvoices([]);
  };

  if (!token) return <Login onLoginSuccess={handleLoginSuccess} />;

  // PLACE IT HERE: This creates a new array of invoices that match your search
  const filteredInvoices = invoices.filter(inv => 
    inv.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>PO & Invoicing Workspace</h2>
        <button onClick={handleLogout} style={{ padding: '6px 12px', cursor: 'pointer' }}>Log Out</button>
      </div>

      <hr />

      <h3>Your Invoices</h3>
      {/* 1. Add the Search Input Here */}
      <input 
        type="text" 
        placeholder="Search by vendor..." 
        onChange={(e) => setSearchTerm(e.target.value)} 
        style={{ padding: '8px', marginBottom: '10px', width: '100%' }}
      />

      {/* 2. Then, pass your filtered list to your table */}
      {filteredInvoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <table>
          {/* ... your table rows ... */}
        </table>
      )}

      {/* Add the form component here */}
      <AddInvoiceForm token={token} onInvoiceAdded={fetchInvoices} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {invoices.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No invoices found. Your connection is working perfectly!</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Invoice #</th>
              <th style={{ padding: '8px' }}>Vendor</th>
              <th style={{ padding: '8px' }}>Amount</th>
              <th style={{ padding: '8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
          {filteredInvoices.map(invoice => (
            <tr key={invoice.id} style={{ borderBottom: '1px solid #eee' }}>
              {/* Invoice Number Cell */}
              <td style={{ padding: '8px' }}>
                {editingId === invoice.id ? 
                  <input 
                    style={editInputStyle} 
                    defaultValue={invoice.vendor_name} 
                    onChange={(e) => setEditData({...editData, vendor_name: e.target.value})} 
                  /> 
                  : invoice.vendor_name}
              </td>
              {/* Vendor Name Cell */}
              <td style={{ padding: '8px' }}>
                {editingId === invoice.id ? 
                  <input 
                    style={editInputStyle} 
                    defaultValue={invoice.vendor_name} 
                    onChange={(e) => setEditData({...editData, vendor_name: e.target.value})} 
                  /> 
                  : invoice.vendor_name}
              </td>
              {/* Amount Cell */}
              <td style={{ padding: '8px' }}>
                {editingId === invoice.id ? 
                  <input 
                    style={editInputStyle} // Add this
                    type="number" 
                    defaultValue={invoice.amount} 
                    onChange={(e) => setEditData({...editData, amount: e.target.value})} 
                  /> 
                  : `$${invoice.amount}`}
              </td>

              {/* Status Cell */}
              <td style={{ padding: '8px' }}>
                {editingId === invoice.id ? 
                  <select 
                    style={editInputStyle} // Add this
                    defaultValue={invoice.status} 
                    onChange={(e) => setEditData({...editData, status: e.target.value})}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  : invoice.status}
              </td>
              {/* Actions Cell */}
              <td style={{ padding: '8px' }}>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                {editingId === invoice.id ? 
                  <button onClick={() => saveEdit(invoice.id)}>Save</button> : 
                  <button onClick={() => { setEditingId(invoice.id); setEditData(invoice); }}>Edit</button>
                }
                <button 
                  onClick={() => deleteInvoice(invoice.id)} 
                  style={{ color: 'red', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </td>
            </tr>
          ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;