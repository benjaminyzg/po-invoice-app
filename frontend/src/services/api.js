import axios from 'axios';

// 1. Create and configure Axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Add Request Interceptor for Auth Header
api.interceptors.request.use((config) => {
    //const token = localStorage.getItem('access_token');
    const token = 
    localStorage.getItem('token') || 
    localStorage.getItem('access_token')|| 
    localStorage.getItem('accessToken') ;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // const refreshToken = localStorage.getItem('refresh_token');
        const refreshToken = localStorage.getItem('refresh'); // Or 'refresh_token'
        const res = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
           refresh: refreshToken,
        });

        // Save new access token
        // localStorage.setItem('access_token', res.data.access);
        localStorage.setItem('token', res.data.access);
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed or expired -> Redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
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