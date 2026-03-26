import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: 'https://batanani-digital-production.up.railway.app/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken || sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;