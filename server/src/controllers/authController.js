/**
 * Auth Controller
 * 
 * Handles user registration and profile management.
 * The first user to register automatically becomes an admin.
 */

import { db } from '../config/firebase.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getDefaultPermissions, validatePermissionKeys, PERMISSIONS } from '../utils/permissions.js';

/**
 * Register a new user in Firestore
 * POST /api/auth/register
 * 
 * Called after Firebase Auth signup to store additional user data.
 * First user becomes admin, all others become regular users.
 */
export const registerUser = asyncHandler(async (req, res) => {
    const { uid, name, email } = req.body;

    // Check if user already exists
    const existingUser = await db.collection('users').doc(uid).get();
    if (existingUser.exists) {
        return res.status(400).json({
            success: false,
            message: 'User already registered'
        });
    }

    // Check if this is the first user (should be admin)
    const usersSnapshot = await db.collection('users').limit(1).get();
    const isFirstUser = usersSnapshot.empty;
    const role = isFirstUser ? 'admin' : 'user';

    // Create user document with default permissions
    const userData = {
        uid,
        name,
        email,
        role,
        permissions: role === 'admin' ? {} : getDefaultPermissions(),
        createdAt: new Date().toISOString()
    };

    await db.collection('users').doc(uid).set(userData);

    res.status(201).json({
        success: true,
        message: `User registered successfully as ${role}`,
        data: {
            uid,
            name,
            email,
            role,
            permissions: userData.permissions
        }
    });
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getProfile = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        data: req.user
    });
});

/**
 * Update current user profile
 * PATCH /api/auth/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const uid = req.user.uid;

    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Name is required'
        });
    }

    const userRef = db.collection('users').doc(uid);
    await userRef.update({ name: name.trim() });

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            ...req.user,
            name: name.trim()
        }
    });
});

/**
 * Get all users (admin only - for assigning cases)
 * GET /api/auth/users
 */
export const getAllUsers = asyncHandler(async (req, res) => {
    const usersSnapshot = await db.collection('users').get();

    const users = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        name: doc.data().name,
        email: doc.data().email,
        role: doc.data().role,
        permissions: doc.data().permissions || {},
        createdAt: doc.data().createdAt
    }));

    res.json({
        success: true,
        data: users
    });
});

/**
 * Get single user by ID with stats
 * GET /api/auth/users/:uid
 */
export const getUserById = asyncHandler(async (req, res) => {
    const { uid } = req.params;

    // Get user document
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    const userData = userDoc.data();

    // Count cases assigned to this user
    const assignedCasesSnapshot = await db.collection('cases')
        .where('assignedTo', '==', uid)
        .get();

    // Count active cases (not closed)
    const activeCases = assignedCasesSnapshot.docs.filter(
        doc => doc.data().status !== 'Closed'
    ).length;

    // Count cases created by this user
    const createdCasesSnapshot = await db.collection('cases')
        .where('createdBy', '==', uid)
        .get();

    res.json({
        success: true,
        data: {
            uid: userDoc.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            createdAt: userData.createdAt,
            stats: {
                assignedCases: assignedCasesSnapshot.size,
                activeCases: activeCases,
                createdCases: createdCasesSnapshot.size
            }
        }
    });
});


/**
 * Update user role (admin only)
 * PATCH /api/auth/users/:uid/role
 */
export const updateUserRole = asyncHandler(async (req, res) => {
    const { uid } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid role. Must be "admin" or "user"'
        });
    }

    // Check if user exists
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Prevent admin from demoting themselves
    if (uid === req.user.uid && role !== 'admin') {
        return res.status(400).json({
            success: false,
            message: 'You cannot demote yourself'
        });
    }

    await userRef.update({ role });

    res.json({
        success: true,
        message: `User role updated to ${role}`,
        data: {
            uid,
            role
        }
    });
});

/**
 * Get user permissions (admin only)
 * GET /api/auth/users/:uid/permissions
 */
export const getUserPermissions = asyncHandler(async (req, res) => {
    const { uid } = req.params;

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    const userData = userDoc.data();

    // Admins don't have granular permissions
    if (userData.role === 'admin') {
        return res.status(400).json({
            success: false,
            message: 'Admin users have full access. Permissions only apply to regular users.'
        });
    }

    res.json({
        success: true,
        data: {
            uid,
            name: userData.name,
            permissions: userData.permissions || getDefaultPermissions()
        }
    });
});

/**
 * Update user permissions (admin only)
 * PATCH /api/auth/users/:uid/permissions
 */
export const updateUserPermissions = asyncHandler(async (req, res) => {
    const { uid } = req.params;
    const { permissions } = req.body;

    if (!permissions || typeof permissions !== 'object') {
        return res.status(400).json({
            success: false,
            message: 'Permissions object is required'
        });
    }

    // Validate permission keys
    const validation = validatePermissionKeys(permissions);
    if (!validation.valid) {
        return res.status(400).json({
            success: false,
            message: `Invalid permission keys: ${validation.invalidKeys.join(', ')}`
        });
    }

    // Validate all values are booleans
    const nonBooleanKeys = Object.entries(permissions)
        .filter(([, value]) => typeof value !== 'boolean')
        .map(([key]) => key);
    if (nonBooleanKeys.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Permission values must be boolean. Invalid: ${nonBooleanKeys.join(', ')}`
        });
    }

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    const userData = userDoc.data();

    if (userData.role === 'admin') {
        return res.status(400).json({
            success: false,
            message: 'Cannot set permissions for admin users. They have full access.'
        });
    }

    // Merge with existing permissions
    const existingPermissions = userData.permissions || getDefaultPermissions();
    const updatedPermissions = { ...existingPermissions, ...permissions };

    await userRef.update({ permissions: updatedPermissions });

    res.json({
        success: true,
        message: 'User permissions updated successfully',
        data: {
            uid,
            permissions: updatedPermissions
        }
    });
});
