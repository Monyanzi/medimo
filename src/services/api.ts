
import axios from 'axios';
import { toast } from 'sonner';

// Create axios instance with configurable base URL
// In development: points to local server (localhost:3001)
// In production: points to deployed API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medimo_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    if (error.response?.status === 401) {
      // Clear auth token and redirect to login
      localStorage.removeItem('medimo_auth_token');
      toast.error('Session expired. Please log in again.');
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.status >= 400) {
      const message = error.response?.data?.message || 'Request failed';
      toast.error(message);
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

export default api;

// API service methods
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData: any) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  }
};

export const healthAPI = {
  getMedications: async () => {
    const response = await api.get('/medications');
    return response.data;
  },

  getAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },

  getDocuments: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  getTimelineEvents: async () => {
    const response = await api.get('/timeline');
    return response.data;
  }
};
