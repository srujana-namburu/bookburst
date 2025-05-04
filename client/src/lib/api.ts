import axios, { AxiosResponse, AxiosError } from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && window.location.pathname !== '/auth') {
      // Handle unauthorized access
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
); 