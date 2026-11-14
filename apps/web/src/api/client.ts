import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // Automatically sends and receives HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
