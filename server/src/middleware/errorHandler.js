/**
 * Global Error Handler Middleware
 * 
 * Catches all errors and returns standardized JSON responses.
 * Logs errors for debugging while hiding internal details from clients.
 */

export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    }

    // Handle Firebase errors
    if (err.code && err.code.startsWith('auth/')) {
        statusCode = 401;
        message = 'Authentication error';
    }

    // Handle Firestore errors
    if (err.code && err.code.includes('firestore')) {
        statusCode = 500;
        message = 'Database error';
    }

    // Don't expose internal server errors in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'An unexpected error occurred';
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * Eliminates need for try-catch in every controller
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};
