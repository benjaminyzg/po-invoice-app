import React, { useState, useEffect } from 'react';
import Login from './Login'; 
import AddInvoiceForm from './AddInvoiceForm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  // Add all of these hooks at the very top:
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [invoices, setInvoices] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(''); // Add this to your state block
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  
const inputStyle = {
  padding: '8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  width: '100%',
  marginBottom: '10px'
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

  const fetchInvoices = async () => {
    const token = localStorage.getItem('token'); // Retrieve the saved token

    const response = await fetch('http://127.0.0.1:8000/api/invoices/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // This is the missing piece:
        'Authorization': `Token ${token}` 
      }
    });

    if (response.ok) {
      const data = await response.json();
        setInvoices(data);    
      } else {
        console.error("Failed to fetch, status:", response.status);    
      }
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

  const markAsPaid = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/invoices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });
      if (response.ok) {
        fetchInvoices(); // Refresh the list
      }
    } catch (err) {
      console.error('Error marking as paid:', err);
    }
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
      .then(data => {
      console.log('Fetched Invoices:', data); 
      setInvoices(data);
    })
    .catch(err => setError(err.message));
    }
  }, [token]);


  const handleLoginSuccess = () => setToken(localStorage.getItem('token'));
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setInvoices([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const invoiceData = {
    invoice_number: invoiceNumber,
    vendor_name: vendorName,
    amount: parseFloat(amount),
    status: status,
    due_date: dueDate,
    po_number: poNumber,
    vendor_address: address,
    item_description: description
    };
    try {
      const response = await fetch('http://127.0.0.1:8000/api/invoices/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(invoiceData)
      });

      if (response.ok) {
        // Refresh the list after saving
        fetchInvoices(); 
        // Clear the form
        setInvoiceNumber('');
        setVendorName('');
        setAmount('');
        setPoNumber('');
        setAddress('');
        setDescription('');
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  if (!token) return <Login onLoginSuccess={handleLoginSuccess} />;

  // PLACE IT HERE: This creates a new array of invoices that match your search
  const filteredInvoices = invoices.filter(inv => 
    inv.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- ADD THE SUMMARY LOGIC HERE ---
  const totalPending = filteredInvoices
  .filter(inv => inv.status === 'PENDING')
  .reduce((sum, inv) => {
    const amount = parseFloat(inv.amount);
    return sum + (isNaN(amount) ? 0 : amount); // Only add if it's a valid number
  }, 0);
  // ----------------------------------
  
  // Calculate totals for the chart
  const pendingTotal = filteredInvoices
  .filter(inv => inv.status === 'PENDING')
  .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

  const paidTotal = filteredInvoices
  .filter(inv => inv.status === 'PAID')
  .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

  const chartData = [
  { name: 'Pending', amount: pendingTotal },
  { name: 'Paid', amount: paidTotal },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mt-6 overflow-hidden">
      <div className="overflow-x-auto">
        <h2>Focus Machinery: PO & Invoicing Workspace</h2>
        <button onClick={handleLogout} style={{ padding: '6px 12px', cursor: 'pointer' }}>Log Out</button>
      </div>

      <hr />

      {/* --- ADD THE SUMMARY RENDER BLOCK HERE --- */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Dashboard Summary</h3>
        <p className="text-gray-600">
          Total Pending Amount: 
          <span className="text-2xl font-bold text-blue-600 ml-2">
            ${totalPending.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </span>
        </p>
      </div>
      {/* ----------------------------------------- */}

      <div style={{ width: '100%', height: 300, marginBottom: '20px' }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Your Small & Short Search Input */}
      <h3>Your Invoices</h3>
      <input 
        type="text" 
        placeholder="Search by vendor..." 
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '8px', marginBottom: '10px', width: '30%' }}
        // ...
      />

      {/* 2. Then, pass your filtered list to your table */}
      {invoices.length === 0 ? (
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
        <table className="min-w-full divide-y divide-gray-200 mt-4">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input style={inputStyle} placeholder="Invoice Number" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} required />
        <input style={inputStyle} placeholder="Vendor Name" value={vendorName} onChange={e => setVendorName(e.target.value)} required />
        <input style={inputStyle} type="number" placeholder="Amount ($)" value={amount} onChange={e => setAmount(e.target.value)} />
        <input style={inputStyle} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        <input style={inputStyle} placeholder="PO Number" value={poNumber} onChange={e => setPoNumber(e.target.value)} />
        <textarea 
          style={{ ...inputStyle, height: '80px', resize: 'vertical' }} 
          placeholder="Vendor Address" 
          value={address} 
          onChange={e => setAddress(e.target.value)} 
        />
      
      <textarea 
        style={{ ...inputStyle, height: '120px', resize: 'vertical' }} 
        placeholder="Item Description" 
        value={description} 
        onChange={e => setDescription(e.target.value)} 
      />

      <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
        Save Invoice
      </button>
    </form>
          <tbody className="bg-white divide-y divide-gray-200">
          {filteredInvoices.map(invoice => (
            <tr key={invoice.id} className="hover:bg-gray-100">
              {/* Invoice Number Cell */}
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === invoice.id ? (
                  <input 
                    style={editInputStyle} 
                    defaultValue={invoice.invoice_number} 
                    onChange={(e) => setEditData({...editData, invoice_number: e.target.value})} 
                  />
                ) : invoice.invoice_number}
              </td>
              {/* Vendor Name Cell */}
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === invoice.id ? 
                  <input 
                    style={editInputStyle} 
                    defaultValue={invoice.vendor_name} 
                    onChange={(e) => setEditData({...editData, vendor_name: e.target.value})} 
                  /> 
                  : invoice.vendor_name}
              </td>
              {/* PO Number Cell */}
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === invoice.id ? (
                  <input 
                    style={editInputStyle} 
                    defaultValue={invoice.po_number} 
                    onChange={(e) => setEditData({...editData, po_number: e.target.value})} 
                  />
                ) : invoice.po_number}
              </td>
              {/* Amount Cell */}
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === invoice.id ? 
                  <input 
                    style={editInputStyle} // Add this
                    type="number" 
                    defaultValue={invoice.amount} 
                    onChange={(e) => setEditData({...editData, amount: e.target.value})} 
                  /> 
              : `$${parseFloat(invoice.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}              
              </td>
              {/* Status Cell */}
              <td className="px-6 py-4 whitespace-nowrap">
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
              <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex space-x-2">
                {editingId === invoice.id ? 
                  <button onClick={() => saveEdit(invoice.id)} className="text-blue-500 hover:text-blue-700">
                    Save
                  </button> : 
                  <button onClick={() => { setEditingId(invoice.id); setEditData(invoice); }} className="text-blue-500 hover:text-blue-700">
                    Edit
                  </button>
                }
                <button 
                  onClick={() => deleteInvoice(invoice.id)} 
                  className="text-red-500 hover:text-red-700"
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