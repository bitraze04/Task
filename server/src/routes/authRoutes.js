/**
 * Auth Routes
 * 
 * Routes for authentication, profile, user management, and permissions.
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/roleMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { PERMISSION_KEYS } from '../utils/permissions.js';
import {
    registerUser,
    getProfile,
    updateProfile,
    getAllUsers,
    getUserById,
    updateUserRole,
    getUserPermissions,
    updateUserPermissions
} from '../controllers/authController.js';

const router = Router();

// Public route — register new user after Firebase Auth signup
router.post('/register', registerUser);

// Protected routes — require authentication
router.get('/me', authMiddleware, getProfile);
router.patch('/profile', authMiddleware, requirePermission(PERMISSION_KEYS.PROFILE_MANAGEMENT), updateProfile);

// User listing — authenticated users can view
router.get('/users', authMiddleware, getAllUsers);
router.get('/users/:uid', authMiddleware, getUserById);

// Admin-only routes
router.patch('/users/:uid/role', authMiddleware, adminMiddleware, updateUserRole);
router.get('/users/:uid/permissions', authMiddleware, adminMiddleware, getUserPermissions);
router.patch('/users/:uid/permissions', authMiddleware, adminMiddleware, updateUserPermissions);

export default router;
