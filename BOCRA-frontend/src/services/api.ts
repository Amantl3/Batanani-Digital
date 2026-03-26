import axios from 'axios';

const api = axios.create({
  baseURL: 'https://batanani-digital-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // This will help you see if Railway is down vs if the route is missing
    console.error("API Error:", error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export default api;