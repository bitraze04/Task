/**
 * Role Middleware
 * 
 * Checks if authenticated user has admin role.
 * Must be used AFTER authMiddleware.
 */

export const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required. You do not have permission to perform this action.'
        });
    }

    next();
};

/**
 * Flexible role check middleware factory
 * @param {string[]} allowedRoles - Array of roles that are allowed access
 */
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
};
