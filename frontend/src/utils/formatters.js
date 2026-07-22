// src/utils/formatters.js

/**
 * Formats a number or numeric string into standard currency ($0.00)
 */
export const formatCurrency = (amount) => {
  const numericAmount = parseFloat(amount || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(isNaN(numericAmount) ? 0 : numericAmount);
};

/**
 * Calculates total sum of line items from an array of items
 */
export const calculateGrandTotal = (lineItems = []) => {
  if (!Array.isArray(lineItems)) return 0;
  return lineItems.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price || item.price) || 0;
    return sum + qty * price;
  }, 0);
};

/**
 * Formats an ISO date string to a clean readable date
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};