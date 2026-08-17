// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // If using Django Basic Auth for development:
  auth: {
    username: 'admin',
    password: 'admin1234',
  },
});

export default api;