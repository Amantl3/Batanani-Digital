import axios from 'axios';

const api = axios.create({
  baseURL: 'https://batanani-digital-production.up.railway.app/api',
});

api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('bocra-auth');
  
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      // We try to find the token, but we don't block if it's missing
      const token = parsed.state?.token || parsed.state?.user?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Hackathon bypass: Requesting without valid token structure");
    }
  }
  return config;
});

export default api;