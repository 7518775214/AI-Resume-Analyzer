import axios from 'axios';

/**
 * Reusable Axios instance with base URL configuration
 * and production-hardened JWT authorization & response interceptors.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout limit
});

/**
 * Request Interceptor:
 * Attaches JWT Bearer token from localStorage to every outgoing request
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Handles responses and global HTTP status codes (401, 429, 500, Network Errors)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Handle Network Errors / Server unreachable
    if (!error.response) {
      const customError = new Error('Network error: Unable to connect to the backend server. Please check your connection.');
      customError.isNetworkError = true;
      return Promise.reject(customError);
    }

    const { status, data } = error.response;

    // 2. Handle 401 Unauthorized (Expired or invalid token)
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login?expired=true';
      }
    }

    // 3. Handle 429 Rate Limiting
    if (status === 429) {
      const message = data?.message || 'Rate limit exceeded. Please slow down and try again in a few minutes.';
      return Promise.reject(new Error(message));
    }

    // 4. Handle Standard API Error payloads
    const serverMessage = data?.message || data?.error || 'An unexpected error occurred.';
    const formattedError = new Error(serverMessage);
    formattedError.status = status;
    formattedError.data = data;

    return Promise.reject(formattedError);
  }
);

export default api;
