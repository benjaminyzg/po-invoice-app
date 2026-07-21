import React, { useState } from 'react';

export default function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Define handleSubmit here!
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api-token-auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        const msg = data?.non_field_errors?.[0] || data?.detail || 'Invalid username or password.';
        setErrorMsg(msg);
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Could not connect to backend server. Make sure Django is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Return JSX
  return (
    <div style={{ maxWidth: '350px', margin: '80px auto', padding: '24px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>Portal Login</h2>
      {errorMsg && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '8px', borderRadius: '4px', marginBottom: '15px' }}>
          {errorMsg}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  card: { maxWidth: '350px', margin: '80px auto', padding: '24px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  field: { marginBottom: '15px' },
  input: { width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  error: { backgroundColor: '#f8d7da', color: '#721c24', padding: '8px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }
};