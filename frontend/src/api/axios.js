import axios from 'axios';
import { getToken, clearToken } from '@/utils/storage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const skipRedirect = error.config?.skipAuthRedirect;
    const isLoginRequest = String(error.config?.url || '').includes('/auth/login');

    if (status === 401 && !skipRedirect && !isLoginRequest) {
      clearToken();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
