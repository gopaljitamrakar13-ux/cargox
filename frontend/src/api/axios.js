import axios from 'axios';

// In development: Vite proxies /api → localhost:5000 (see vite.config.js)
// In production:  VITE_API_URL must point to your Render backend
//   e.g. VITE_API_URL=https://cargox-backend.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || 'https://cargox.onrender.com/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 422) {
      // Token expired or invalid — clear storage
      localStorage.removeItem('access_token');
      // Redirect to login if not already there
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
