/**
 * Comment Controller
 * 
 * Handles comments on cases.
 * Comments are stored as a subcollection under each case.
 * Now includes activity logging.
 */

import { db } from '../config/firebase.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createActivity, ActivityTypes, generateActivityMessage } from '../services/activityService.js';

/**
 * Add a comment to a case
 * POST /api/cases/:id/comments
 * All authenticated users
 */
export const addComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;

    // Verify case exists
    const caseDoc = await db.collection('cases').doc(id).get();
    if (!caseDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'Case not found'
        });
    }

    const commentData = {
        caseId: id,
        authorId: req.user.uid,
        authorName: req.user.name,
        message,
        createdAt: new Date().toISOString()
    };

    const commentRef = await db
        .collection('cases')
        .doc(id)
        .collection('comments')
        .add(commentData);

    // Log activity
    await createActivity(id, {
        type: ActivityTypes.COMMENT_ADDED,
        message: generateActivityMessage(ActivityTypes.COMMENT_ADDED, req.user.name),
        performedByUid: req.user.uid,
        performedByName: req.user.name,
        metadata: { commentId: commentRef.id }
    });

    res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: {
            id: commentRef.id,
            ...commentData
        }
    });
});

/**
 * Get all comments for a case
 * GET /api/cases/:id/comments
 * All authenticated users
 */
export const getComments = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verify case exists
    const caseDoc = await db.collection('cases').doc(id).get();
    if (!caseDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'Case not found'
        });
    }

    const commentsSnapshot = await db
        .collection('cases')
        .doc(id)
        .collection('comments')
        .orderBy('createdAt', 'asc')
        .get();

    const comments = commentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    res.json({
        success: true,
        count: comments.length,
        data: comments
    });
});

/**
 * Edit a comment (own comments only)
 * PATCH /api/cases/:id/comments/:commentId
 */
export const editComment = asyncHandler(async (req, res) => {
    const { id, commentId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Comment message is required'
        });
    }

    const caseDoc = await db.collection('cases').doc(id).get();
    if (!caseDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'Case not found'
        });
    }

    const commentRef = db.collection('cases').doc(id).collection('comments').doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'Comment not found'
        });
    }

    if (commentDoc.data().authorId !== req.user.uid && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'You can only edit your own comments'
        });
    }

    await commentRef.update({
        message: message.trim(),
        editedAt: new Date().toISOString()
    });

    const updatedComment = await commentRef.get();

    res.json({
        success: true,
        message: 'Comment updated successfully',
        data: {
            id: updatedComment.id,
            ...updatedComment.data()
        }
    });
});

/**
 * Delete a comment (own comments only, or admin)
 * DELETE /api/cases/:id/comments/:commentId
 */
export const deleteComment = asyncHandler(async (req, res) => {
    const { id, commentId } = req.params;

    const caseDoc = await db.collection('cases').doc(id).get();
    if (!caseDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'Case not found'
        });
    }

    const commentRef = db.collection('cases').doc(id).collection('comments').doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'Comment not found'
        });
    }

    if (commentDoc.data().authorId !== req.user.uid && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'You can only delete your own comments'
        });
    }

    await commentRef.delete();

    res.json({
        success: true,
        message: 'Comment deleted successfully'
    });
});
