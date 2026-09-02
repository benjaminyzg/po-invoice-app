import axios from 'axios';

// 1. Create and configure Axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Add Request Interceptor for Auth Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Helper Functions
export const validateInvoiceMatch = async (invoiceId) => {
  const response = await api.post(`/invoices/${invoiceId}/validate-match/`);
  return response.data;
};

export const downloadPackingList = async (invoiceId) => {
  const response = await api.get(`/invoices/${invoiceId}/packing-list/`, {
    responseType: 'blob',
  });
  return response.data;
};

export default api;