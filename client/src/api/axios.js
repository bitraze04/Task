/**
 * Axios Instance Configuration
 * 
 * Configured with base URL and automatic token injection.
 */

import axios from 'axios';
import { auth } from '../firebase/config';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle specific error codes
        if (error.response?.status === 401) {
            // Token expired or invalid - could trigger logout here
            console.error('Authentication error:', error.response.data);
        }
        return Promise.reject(error);
    }
);

export default api;
