import axios from 'axios';

// Adjust your base URL to match your Django development server
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Token ${token}` } } : {};
};

export const quotationService = {
    
  // Fetch all payment term templates (e.g., Net 30)
  async getPaymentTerms() {
    const response = await axios.get(`${API_BASE_URL}/payment-terms/`);
    return response.data;
  },

  // Fetch catalog items to populate line item options securely
  async getCatalogItems() {
    const response = await axios.get(`${API_BASE_URL}/catalog-items/`);
    return response.data;
  },

  // Fetch list of existing quotations
  async getQuotations() {
    const response = await axios.get(`${API_BASE_URL}/quotations/`);
    return response.data;
  },

  // Create a new quotation enforcing pricing rules and schedules
  async createQuotation(quotationData) {
    const response = await axios.post(`${API_BASE_URL}/quotations/`, quotationData);
    return response.data;
  }
};