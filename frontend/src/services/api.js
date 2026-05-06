import axios from 'axios';

const api = axios.create({
  // Use Vercel rewrite route '/api' in production, localhost in development
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token automatically to all requests
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

export default api;
