// src/components/POList.jsx
import React, { useEffect, useState } from 'react';
import { getPurchaseOrders, updatePOStatus } from '../services/poService';

export default function POList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // 1. Fetch Purchase Orders on initial load
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getPurchaseOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch purchase orders.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Status Update
  const handleStatusChange = async (poId, newStatus) => {
    setUpdatingId(poId);
    try {
      const response = await updatePOStatus(poId, newStatus);
      
      // Update local state directly so the table updates instantly
      const updatedPO = response.data;
      setOrders((prevOrders) =>
        prevOrders.map((po) => (po.id === poId ? updatedPO : po))
      );
    } catch (err) {
      alert(
        err.response?.data?.status?.[0] || 
        err.response?.data?.detail || 
        'Failed to update status.'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p className="p-4">Loading purchase orders...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Purchase Orders</h2>
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">PO Number</th>
            <th className="p-2 border">Vendor</th>
            <th className="p-2 border">Total Amount</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((po) => (
            <tr key={po.id} className="border-b">
              <td className="p-2 border">{po.po_number}</td>
              <td className="p-2 border">{po.vendor_name}</td>
              <td className="p-2 border">${po.total_amount}</td>
              <td className="p-2 border font-semibold">{po.status}</td>
              <td className="p-2 border">
                <select
                  value=""
                  disabled={updatingId === po.id || po.status === 'CANCELLED' || po.status === 'PAID'}
                  onChange={(e) => handleStatusChange(po.id, e.target.value)}
                  className="p-1 border rounded bg-white text-sm cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled>
                    {updatingId === po.id ? 'Updating...' : 'Change status...'}
                  </option>
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="RECEIVED">RECEIVED</option>
                  <option value="PAID">PAID</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}