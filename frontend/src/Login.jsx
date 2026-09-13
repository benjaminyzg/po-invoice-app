import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        username,
        password,
      });

      // Save JWT access token inside the handler function
      const accessToken = response.data.access;
      localStorage.setItem('token', accessToken);
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      setToken(accessToken);
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Invalid username or password');
    }
  };

  return (
    <div style={{ maxWidth: '350px', margin: '80px auto', padding: '24px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>Focus Machinery; PO-Invoice-App; Portal Login</h2>
      {errorMsg && <p style={{ color: 'red', textAlign: 'center' }}>{errorMsg}</p>}
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
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Log In
        </button>
      </form>
    </div>
  );
}