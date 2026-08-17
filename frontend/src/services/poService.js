// src/services/poService.js
import api from './api';

// Update PO status
export const updatePOStatus = async (id, status) => {
  const response = await api.patch(`/purchase-orders/${id}/update-status/`, {
    status,
  });
  return response.data;
};

// Get all POs
export const getPurchaseOrders = async () => {
  const response = await api.get('/purchase-orders/');
  return response.data;
};