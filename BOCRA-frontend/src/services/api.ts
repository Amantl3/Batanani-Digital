import axios from 'axios';

const api = axios.create({
  // Make sure there is NO trailing slash after /api
  baseURL: 'https://batanani-digital-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to help you debug in the console
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`API Error [${error.response?.status}]:`, error.config.url);
    return Promise.reject(error);
  }
);

export default api;