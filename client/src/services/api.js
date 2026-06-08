import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_MARKETPLACE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token into Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, data } = error.response || {};
    const addToast = useUIStore.getState().addToast;

    if (status === 401) {
      // Token expired or invalid -> clear store and redirect
      useAuthStore.getState().logout();
      addToast('Session expired. Please log in again.', 'error');
    } else if (status === 429) {
      addToast('Rate limit exceeded! Please wait a moment.', 'warning');
    } else {
      addToast(data?.error || 'An unexpected error occurred.', 'error');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
