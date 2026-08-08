import axios from 'axios';
import { auth } from './firebase';

const defaultApiUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
  ? 'https://lms-project-1-uwbn.onrender.com/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Inject Bearer Token on authenticated requests (caching from localStorage for sandbox compatibility)
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('authToken');
    
    if (!token && auth.currentUser) {
      try {
        token = await auth.currentUser.getIdToken();
        localStorage.setItem('authToken', token);
      } catch (error) {
        console.error('Failed to retrieve Firebase ID Token:', error);
      }
    }

    if (!token) {
      token = 'mock-student';
      localStorage.setItem('authToken', token);
    }

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
