import axios from 'axios';

/** Relative URLs work with Vite proxy (dev) and when the API serves the SPA (prod). */
const API_URL = import.meta.env.VITE_API_URL ?? '';
const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

export const aiApi = axios.create({
  baseURL: AI_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
      try {
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('token', data.token);
        error.config.headers.Authorization = `Bearer ${data.token}`;
        return api(error.config);
      } catch {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
