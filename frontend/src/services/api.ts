import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const homeAPI = {
  getHomeData: () => apiClient.get('/home/data'),
  getCarousel: () => apiClient.get('/home/carousel'),
  getFeaturedMajors: () => apiClient.get('/home/featured-majors'),
  getNews: (limit: number = 5) => apiClient.get(`/home/news?limit=${limit}`),
};

export const authAPI = {
  register: (email: string, password: string, username: string) =>
    apiClient.post('/auth/register', { email, password, username }),
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  getCurrentUser: () => apiClient.get('/auth/me'),
};
