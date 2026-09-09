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

  // Fetch all quotations
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/quotations/`, getAuthHeaders());
    return response.data;
  },

  // Fetch list of existing quotations
  getQuotations: async () => {
    const response = await axios.get(`${API_BASE_URL}/quotations/`, getAuthHeaders());
    return response.data;
  },

  // Create quotation (supports both .create and .createQuotation)
  create: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/quotations/`, data, getAuthHeaders());
    return response.data;
  },

  // Create a new quotation
  createQuotation: async (quotationData) => {
    const response = await axios.post(`${API_BASE_URL}/quotations/`, quotationData, getAuthHeaders());
    return response.data;
  },

  // Update quotation (supports both .update and .updateQuotation)
  update: async (id, data) => {
    const response = await axios.put(`${API_BASE_URL}/quotations/${id}/`, data, getAuthHeaders());
    return response.data;
  },

  // Update an existing quotation
  updateQuotation: async (id, quotationData) => {
    const response = await axios.put(`${API_BASE_URL}/quotations/${id}/`, quotationData, getAuthHeaders());
    return response.data;
  },

  // Delete quotation (supports both .delete and .deleteQuotation)
  delete: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/quotations/${id}/`, getAuthHeaders());
    return response.data;
  },

  // Delete a quotation by ID
  deleteQuotation: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/quotations/${id}/`, getAuthHeaders());
    return response.data;
  },
};