import axios from 'axios';

const api = axios.create({
  // Direct link to your LIVE Railway backend
  baseURL: 'https://batanani-digital-production.up.railway.app/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// This attaches your login token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;