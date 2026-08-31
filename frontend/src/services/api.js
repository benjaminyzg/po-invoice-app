// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach Django Token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// 3-Way Match validation helper
export const validateInvoiceMatch = async (invoiceId) => {
  const response = await api.post(`/invoices/${invoiceId}/validate-match/`);
  return response.data;
};

export default api;