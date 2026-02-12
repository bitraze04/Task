/**
 * Case Routes
 * 
 * Routes for case CRUD, status updates, assignment, comments, and watching.
 * Permission-gated for regular users.
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/roleMiddleware.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';
import { PERMISSION_KEYS } from '../utils/permissions.js';
import {
    createCase,
    getAllCases,
    getCaseById,
    updateCase,
    updateCaseStatus,
    assignCase,
    assignToSelf,
    deleteCase,
    watchCase,
    unwatchCase
} from '../controllers/caseController.js';
import {
    addComment,
    getComments,
    editComment,
    deleteComment
} from '../controllers/commentController.js';
import { getCaseActivities } from '../controllers/activityController.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Case CRUD
router.post('/', requirePermission(PERMISSION_KEYS.CREATE_CASE), createCase);
router.get('/', requirePermission(PERMISSION_KEYS.VIEW_CASES), getAllCases);
router.get('/:id', requirePermission(PERMISSION_KEYS.VIEW_CASES), getCaseById);
router.put('/:id', requirePermission(PERMISSION_KEYS.EDIT_OWN_CASES), updateCase);
router.delete('/:id', adminMiddleware, deleteCase);

// Status & Assignment
router.patch('/:id/status', adminMiddleware, updateCaseStatus);
router.patch('/:id/assign', adminMiddleware, assignCase);
router.patch('/:id/take', requirePermission(PERMISSION_KEYS.ASSIGN_TO_SELF), assignToSelf);

// Watching
router.patch('/:id/watch', requirePermission(PERMISSION_KEYS.WATCH_CASE), watchCase);
router.patch('/:id/unwatch', requirePermission(PERMISSION_KEYS.WATCH_CASE), unwatchCase);

// Comments
router.post('/:id/comments', requirePermission(PERMISSION_KEYS.COMMENT_ON_CASES), addComment);
router.get('/:id/comments', requirePermission(PERMISSION_KEYS.VIEW_CASES), getComments);
router.patch('/:id/comments/:commentId', requirePermission(PERMISSION_KEYS.COMMENT_ON_CASES), editComment);
router.delete('/:id/comments/:commentId', requirePermission(PERMISSION_KEYS.COMMENT_ON_CASES), deleteComment);

// Activities
router.get('/:id/activities', getCaseActivities);

export default router;
