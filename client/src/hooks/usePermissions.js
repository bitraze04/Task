/**
 * Custom Hook: usePermissions
 * 
 * Provides permission checking for the current user.
 * Admins automatically have all permissions.
 */

import { useSelector } from 'react-redux';
import { USER_ROLES } from '../utils/constants';

export const usePermissions = () => {
    const { user } = useSelector(state => state.auth);

    const isAdmin = user?.role === USER_ROLES.ADMIN;
    const permissions = user?.permissions || {};

    /**
     * Check if current user has a specific permission.
     * Admins always return true.
     */
    const hasPermission = (permissionKey) => {
        if (!user) return false;
        if (isAdmin) return true;
        return permissions[permissionKey] === true;
    };

    /**
     * Check if current user has ANY of the given permissions.
     */
    const hasAnyPermission = (...permissionKeys) => {
        if (!user) return false;
        if (isAdmin) return true;
        return permissionKeys.some(key => permissions[key] === true);
    };

    /**
     * Check if current user has ALL of the given permissions.
     */
    const hasAllPermissions = (...permissionKeys) => {
        if (!user) return false;
        if (isAdmin) return true;
        return permissionKeys.every(key => permissions[key] === true);
    };

    return {
        permissions,
        isAdmin,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions
    };
};

export default usePermissions;
