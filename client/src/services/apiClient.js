/**
 * API Client
 * 
 * Centralized Axios instance with Firebase auth token attachment
 * and global error handling.
 */

import axios from 'axios';
import { auth } from '../firebase/config';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - attach Firebase auth token
apiClient.interceptors.request.use(
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

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Try to refresh token
            const user = auth.currentUser;
            if (user) {
                try {
                    const token = await user.getIdToken(true); // Force refresh
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    // If refresh fails, sign out
                    await auth.signOut();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // No user, redirect to login
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
