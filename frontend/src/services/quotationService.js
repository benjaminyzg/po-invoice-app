import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Helper to get auth headers consistently
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('access');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const quotationService = {
  // Fetch all payment term templates
  getPaymentTerms: async () => {
    const response = await axios.get(`${API_BASE_URL}/payment-terms/`, getAuthHeaders());
    return response.data;
  },

  // Fetch catalog items
  getCatalogItems: async () => {
    const response = await axios.get(`${API_BASE_URL}/catalog-items/`, getAuthHeaders());
    return response.data;
  },

  // Fetch list of existing quotations
  getQuotations: async () => {
    const response = await axios.get(`${API_BASE_URL}/quotations/`, getAuthHeaders());
    return response.data;
  },

  // Create a new quotation
  createQuotation: async (quotationData) => {
    const response = await axios.post(`${API_BASE_URL}/quotations/`, quotationData, getAuthHeaders());
    return response.data;
  }
};