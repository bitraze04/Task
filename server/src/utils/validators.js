/**
 * Input Validation Helpers
 * 
 * Express-validator schemas for validating request data.
 */

import { body, param, query } from 'express-validator';

// Validation rules for user registration
export const registerValidation = [
    body('uid')
        .notEmpty()
        .withMessage('User ID is required')
        .isString()
        .trim(),
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isString()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail()
];

// Validation rules for creating a case
export const createCaseValidation = [
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isString()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
    body('description')
        .notEmpty()
        .withMessage('Description is required')
        .isString()
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('Description must be between 10 and 5000 characters'),
    body('priority')
        .notEmpty()
        .withMessage('Priority is required')
        .isIn(['Low', 'Medium', 'High'])
        .withMessage('Priority must be Low, Medium, or High'),
    body('assignedTo')
        .optional()
        .isString()
        .trim()
];

// Validation rules for updating a case
export const updateCaseValidation = [
    param('id')
        .notEmpty()
        .withMessage('Case ID is required'),
    body('title')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
    body('description')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('Description must be between 10 and 5000 characters'),
    body('priority')
        .optional()
        .isIn(['Low', 'Medium', 'High'])
        .withMessage('Priority must be Low, Medium, or High'),
    body('status')
        .optional()
        .isIn(['Open', 'In Progress', 'Closed'])
        .withMessage('Status must be Open, In Progress, or Closed'),
    body('assignedTo')
        .optional()
        .isString()
        .trim()
];

// Validation for status update only
export const updateStatusValidation = [
    param('id')
        .notEmpty()
        .withMessage('Case ID is required'),
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['Open', 'In Progress', 'Closed'])
        .withMessage('Status must be Open, In Progress, or Closed')
];

// Validation for adding a comment
export const addCommentValidation = [
    param('id')
        .notEmpty()
        .withMessage('Case ID is required'),
    body('message')
        .notEmpty()
        .withMessage('Comment message is required')
        .isString()
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Comment must be between 1 and 2000 characters')
];

// Validation for case ID parameter
export const caseIdValidation = [
    param('id')
        .notEmpty()
        .withMessage('Case ID is required')
        .isString()
];

/**
 * Middleware to check validation results
 */
import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};
