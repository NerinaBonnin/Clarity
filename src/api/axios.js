import axios from 'axios';

// Vite lee las variables con import.meta.env.VITE_...
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:5000/api',
});

export default api;