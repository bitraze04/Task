/**
 * Permission Middleware
 * 
 * Checks if authenticated user has specific permissions.
 * Admins bypass all permission checks.
 * Must be used AFTER authMiddleware.
 */

import { PERMISSION_KEYS } from '../utils/permissions.js';

/**
 * Middleware factory that requires one or more permissions.
 * Admin role always passes. Regular users need at least one of the specified permissions.
 * @param {...string} requiredPermissions - Permission keys to check (OR logic)
 */
export const requirePermission = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Admins bypass all permission checks
        if (req.user.role === 'admin') {
            return next();
        }

        // Check if user has at least one of the required permissions
        const userPermissions = req.user.permissions || {};
        const hasPermission = requiredPermissions.some(perm => userPermissions[perm] === true);

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action.',
                requiredPermissions
            });
        }

        next();
    };
};

/**
 * Middleware that requires ALL specified permissions (AND logic).
 * Admin role always passes.
 * @param {...string} requiredPermissions - All permission keys must be enabled
 */
export const requireAllPermissions = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Admins bypass all permission checks
        if (req.user.role === 'admin') {
            return next();
        }

        const userPermissions = req.user.permissions || {};
        const hasAll = requiredPermissions.every(perm => userPermissions[perm] === true);

        if (!hasAll) {
            const missing = requiredPermissions.filter(perm => !userPermissions[perm]);
            return res.status(403).json({
                success: false,
                message: 'You do not have all required permissions for this action.',
                missingPermissions: missing
            });
        }

        next();
    };
};
