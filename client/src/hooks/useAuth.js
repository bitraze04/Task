/**
 * Custom Hook: useAuth
 * 
 * Provides authentication state and utility functions.
 */

import { useSelector } from 'react-redux';
import { USER_ROLES } from '../utils/constants';

export const useAuth = () => {
    const { user, isLoading, isInitialized, error } = useSelector(state => state.auth);

    const isAuthenticated = !!user;
    const isAdmin = user?.role === USER_ROLES.ADMIN;

    return {
        user,
        isLoading,
        isInitialized,
        error,
        isAuthenticated,
        isAdmin
    };
};

export default useAuth;
