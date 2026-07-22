import axios from 'axios';

const api = axios.create({
  baseURL: 'https://clarity-production-d074.up.railway.app/api',
});

export default api;