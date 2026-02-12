/**
 * Case Controller
 * 
 * Handles CRUD operations for cases/tasks.
 * Permission-based access for regular users.
 * Includes activity logging and status workflow validation.
 */

import { db } from '../config/firebase.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createActivity, ActivityTypes, generateActivityMessage } from '../services/activityService.js';

// Valid status transitions
const VALID_STATUS_TRANSITIONS = {
    'Open': ['In Progress'],
    'In Progress': ['Closed'],
    'Closed': [] // Cannot transition from Closed
};

/**
 * Validate status transition
 */
const isValidStatusTransition = (currentStatus, newStatus) => {
    if (currentStatus === newStatus) return true; // No change
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
};

/**
 * Create a new case
 * POST /api/cases
 * Admin or users with create_case permission
 */
export const createCase = asyncHandler(async (req, res) => {
    const { title, description, priority, assignedTo, dueDate } = req.body;
    const isAdmin = req.user.role === 'admin';

    const caseData = {
        title,
        description,
        priority: isAdmin ? priority : 'Medium', // Regular users get default priority
        status: 'Open',
        createdBy: req.user.uid,
        createdByName: req.user.name,
        assignedTo: isAdmin ? (assignedTo || null) : null, // Regular users cannot assign
        assignedToName: null,
        dueDate: isAdmin ? (dueDate || null) : null, // Regular users cannot set due date
        watchers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // If assignedTo is provided and user is admin, get the user's name
    if (isAdmin && assignedTo) {
        const assignedUserDoc = await db.collection('users').doc(assignedTo).get();
        if (assignedUserDoc.exists) {
            caseData.assignedToName = assignedUserDoc.data().name;
        }
    }

    const caseRef = await db.collection('cases').add(caseData);

    // Log activity
    await createActivity(caseRef.id, {
        type: ActivityTypes.CASE_CREATED,
        message: generateActivityMessage(ActivityTypes.CASE_CREATED, req.user.name),
        performedByUid: req.user.uid,
        performedByName: req.user.name
    });

    res.status(201).json({
        success: true,
        message: 'Case created successfully',
        data: {
            id: caseRef.id,
            ...caseData
        }
    });
});

/**
 * Get all cases with pagination
 * GET /api/cases
 * All authenticated users
 */
export const getAllCases = asyncHandler(async (req, res) => {
    const { status, priority, search, limit = 50, cursor } = req.query;
    const limitNum = Math.min(parseInt(limit) || 50, 100);

    let query = db.collection('cases').orderBy('createdAt', 'desc');

    // Apply cursor for pagination
    if (cursor) {
        const cursorDoc = await db.collection('cases').doc(cursor).get();
        if (cursorDoc.exists) {
            query = query.startAfter(cursorDoc);
        }
    }

    query = query.limit(limitNum + 1); // Fetch one extra to check if more exist

    const casesSnapshot = await query.get();

    let cases = casesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    // Check if there are more results
    const hasMore = cases.length > limitNum;
    if (hasMore) {
        cases = cases.slice(0, limitNum);
    }
    const nextCursor = hasMore ? cases[cases.length - 1].id : null;

    // Apply filters in memory
    if (status && status !== 'All') {
        cases = cases.filter(c => c.status === status);
    }
    if (priority) {
        cases = cases.filter(c => c.priority === priority);
    }
    if (search) {
        const searchLower = search.toLowerCase();
        cases = cases.filter(c =>
            c.title?.toLowerCase().includes(searchLower) ||
            c.description?.toLowerCase().includes(searchLower) ||
            c.createdByName?.toLowerCase().includes(searchLower) ||
            c.assignedToName?.toLowerCase().includes(searchLower)
        );
    }

    res.json({
        success: true,
        count: cases.length,
        hasMore,
        nextCursor,
        data: cases
    });
});

/**
 * Get single case by ID
 * GET /api/cases/:id
 * All authenticated users
 */
export const getCaseById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const caseDoc = await db.collection('cases').doc(id).get();

    if (!caseDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'Case not found'
        });
    }

    res.json({
        success: true,
        data: {
            id: caseDoc.id,
            ...caseDoc.data()
        }
    });
});

/**
 * Update a case
 * PUT /api/cases/:id
 * Admin or users with edit_own_cases permission (title/description only, own cases)
 */
export const updateCase = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, priority, status, assignedTo, dueDate } = req.body;

    const caseRef = db.collection('cases').doc(id);
    const caseDoc = await caseRef.get();

    if (!caseDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'Case not found'
        });
    }

    const currentData = caseDoc.data();
    const isAdmin = req.user.role === 'admin';

    // Non-admin users can only edit their own cases (title and description only)
    if (!isAdmin) {
        if (currentData.createdBy !== req.user.uid) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit cases you created'
            });
        }
        // Regular users cannot change priority, status, assignment, or due date
        if (priority !== undefined || status !== undefined || assignedTo !== undefined || dueDate !== undefined) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit the title and description of your own cases'
            });
        }
    }

    // Validate status transition
    if (status !== undefined && status !== currentData.status) {
        if (!isValidStatusTransition(currentData.status, status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition: ${currentData.status} → ${status}. Allowed: ${VALID_STATUS_TRANSITIONS[currentData.status]?.join(', ') || 'none'}`
            });
        }
    }

    const updateData = {
        updatedAt: new Date().toISOString()
    };

    // Track changes for activity logging
    const changes = [];

    if (title !== undefined && title !== currentData.title) {
        updateData.title = title;
        changes.push('title');
    }
    if (description !== undefined && description !== currentData.description) {
        updateData.description = description;
        changes.push('description');
    }
    if (isAdmin && priority !== undefined && priority !== currentData.priority) {
        updateData.priority = priority;
    }
    if (isAdmin && dueDate !== undefined && dueDate !== currentData.dueDate) {
        updateData.dueDate = dueDate;
        changes.push('due date');
    }

    // Handle status change
    if (status !== undefined && status !== currentData.status) {
        updateData.status = status;

        await caseRef.update(updateData);

        // Log status change activity
        await createActivity(id, {
            type: ActivityTypes.STATUS_CHANGED,
            message: generateActivityMessage(ActivityTypes.STATUS_CHANGED, req.user.name, { oldStatus: currentData.status, newStatus: status }),
            performedByUid: req.user.uid,
            performedByName: req.user.name,
            metadata: { oldStatus: currentData.status, newStatus: status }
        });
    }

    // Handle priority change
    if (isAdmin && priority !== undefined && priority !== currentData.priority) {
        if (!updateData.status) {
            // Only update if not already updated by status change above
            await caseRef.update(updateData);
        }

        // Log priority change activity
        await createActivity(id, {
            type: ActivityTypes.PRIORITY_CHANGED,
            message: generateActivityMessage(ActivityTypes.PRIORITY_CHANGED, req.user.name, { oldPriority: currentData.priority, newPriority: priority }),
            performedByUid: req.user.uid,
            performedByName: req.user.name,
            metadata: { oldPriority: currentData.priority, newPriority: priority }
        });
    }

    // Handle assignment change
    if (isAdmin && assignedTo !== undefined && assignedTo !== currentData.assignedTo) {
        updateData.assignedTo = assignedTo;
        if (assignedTo) {
            const assignedUserDoc = await db.collection('users').doc(assignedTo).get();
            if (assignedUserDoc.exists) {
                updateData.assignedToName = assignedUserDoc.data().name;
            }
        } else {
            updateData.assignedToName = null;
        }

        await caseRef.update(updateData);

        // Log assignment change activity
        await createActivity(id, {
            type: ActivityTypes.ASSIGNED_USER_CHANGED,
            message: generateActivityMessage(ActivityTypes.ASSIGNED_USER_CHANGED, req.user.name, { assignedToName: updateData.assignedToName }),
            performedByUid: req.user.uid,
            performedByName: req.user.name,
            metadata: {
                oldAssignedTo: currentData.assignedTo,
                newAssignedTo: assignedTo,
                assignedToName: updateData.assignedToName
            }
        });
    }

    // Log general edit if other fields changed
    if (changes.length > 0) {
        await caseRef.update(updateData);

        await createActivity(id, {
            type: ActivityTypes.CASE_EDITED,
            message: generateActivityMessage(ActivityTypes.CASE_EDITED, req.user.name, { changedFields: changes }),
            performedByUid: req.user.uid,
            performedByName: req.user.name,
            metadata: { changedFields: changes }
        });
    } else if (Object.keys(updateData).length > 1) {
        // Only updatedAt changed, still update
        await caseRef.update(updateData);
    }

    const updatedDoc = await caseRef.get();

    res.json({
        success: true,
        message: 'Case updated successfully',
        data: {
            id: updatedDoc.id,
            ...updatedDoc.data()
        }
    });
});

/**
 * Update case status only
 * PATCH /api/cases/:id/status
 * Admin only
 */
export const updateCaseStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const caseRef = db.collection('cases').doc(id);
    const caseDoc = await caseRef.get();

    if (!caseDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'Case not found'
        });
    }

    const currentData = caseDoc.data();

    // Validate status transition
    if (!isValidStatusTransition(currentData.status, status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status transition: ${currentData.status} → ${status}. Allowed: ${VALID_STATUS_TRANSITIONS[currentData.status]?.join(', ') || 'none'}`
        });
    }

    await caseRef.update({
        status,
        updatedAt: new Date().toISOString()
    });

    // Log activity
    await createActivity(id, {
        type: ActivityTypes.STATUS_CHANGED,
        message: generateActivityMessage(ActivityTypes.STATUS_CHANGED, req.user.name, { oldStatus: currentData.status, newStatus: status }),
        performedByUid: req.user.uid,
        performedByName: req.user.name,
        metadata: { oldStatus: currentData.status, newStatus: status }
    });

    res.json({
        success: true,
        message: `Case status updated to ${status}`,
        data: {
            id,
            status
        }
    });
});

/**
 * Assign case to user
 * PATCH /api/cases/:id/assign
 * Admin only
 */
export const assignCase = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const caseRef = db.collection('cases').doc(id);
    const caseDoc = await caseRef.get();

    if (!caseDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'Case not found'
        });
    }

    const updateData = {
        assignedTo: assignedTo || null,
        assignedToName: null,
        updatedAt: new Date().toISOString()
    };

    if (assignedTo) {
        const assignedUserDoc = await db.collection('users').doc(assignedTo).get();
        if (assignedUserDoc.exists) {
            updateData.assignedToName = assignedUserDoc.data().name;
        } else {
            return res.status(404).json({
                success: false,
                message: 'Assigned user not found'
            });
        }
    }

    await caseRef.update(updateData);

    // Log activity
    await createActivity(id, {
        type: ActivityTypes.ASSIGNED_USER_CHANGED,
        message: generateActivityMessage(ActivityTypes.ASSIGNED_USER_CHANGED, req.user.name, { assignedToName: updateData.assignedToName }),
        performedByUid: req.user.uid,
        performedByName: req.user.name,
        metadata: { assignedTo, assignedToName: updateData.assignedToName }
    });

    res.json({
        success: true,
        message: assignedTo ? `Case assigned to ${updateData.assignedToName}` : 'Case unassigned',
        data: {
            id,
            assignedTo: updateData.assignedTo,
            assignedToName: updateData.assignedToName
        }
    });
});

/**
 * Delete a case
 * DELETE /api/cases/:id
 * Admin only
 */
export const deleteCase = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const caseRef = db.collection('cases').doc(id);
    const caseDoc = await caseRef.get();

    if (!caseDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'Case not found'
        });
    }

    // Delete all comments and activities in subcollections
    const batch = db.batch();

    const commentsSnapshot = await caseRef.collection('comments').get();
    commentsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    const activitiesSnapshot = await caseRef.collection('activities').get();
    activitiesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    batch.delete(caseRef);
    await batch.commit();

    res.json({
        success: true,
        message: 'Case deleted successfully'
    });
});

/**
 * Assign case to self ("Take Task")
 * PATCH /api/cases/:id/take
 * Users with assign_to_self permission
 */
export const assignToSelf = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const caseRef = db.collection('cases').doc(id);
    const caseDoc = await caseRef.get();

    if (!caseDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'Case not found'
        });
    }

    const currentData = caseDoc.data();

    // Can only take unassigned cases
    if (currentData.assignedTo) {
        return res.status(400).json({
            success: false,
            message: 'This case is already assigned to someone. You can only take unassigned cases.'
        });
    }

    await caseRef.update({
        assignedTo: req.user.uid,
        assignedToName: req.user.name,
        updatedAt: new Date().toISOString()
    });

    // Log activity
    await createActivity(id, {
        type: ActivityTypes.ASSIGNED_USER_CHANGED,
        message: generateActivityMessage(ActivityTypes.ASSIGNED_USER_CHANGED, req.user.name, { assignedToName: req.user.name }),
        performedByUid: req.user.uid,
        performedByName: req.user.name,
        metadata: {
            oldAssignedTo: null,
            newAssignedTo: req.user.uid,
            assignedToName: req.user.name,
            selfAssigned: true
        }
    });

    res.json({
        success: true,
        message: 'You have taken this task',
        data: {
            id,
            assignedTo: req.user.uid,
            assignedToName: req.user.name
        }
    });
});

/**
 * Watch / follow a case
 * PATCH /api/cases/:id/watch
 * Users with watch_case permission
 */
export const watchCase = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const caseRef = db.collection('cases').doc(id);
    const caseDoc = await caseRef.get();

    if (!caseDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'Case not found'
        });
    }

    const currentData = caseDoc.data();
    const watchers = currentData.watchers || [];

    if (watchers.includes(req.user.uid)) {
        return res.status(400).json({
            success: false,
            message: 'You are already watching this case'
        });
    }

    watchers.push(req.user.uid);
    await caseRef.update({ watchers });

    res.json({
        success: true,
        message: 'You are now watching this case',
        data: { id, watching: true }
    });
});

/**
 * Unwatch / unfollow a case
 * PATCH /api/cases/:id/unwatch
 * Users with watch_case permission
 */
export const unwatchCase = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const caseRef = db.collection('cases').doc(id);
    const caseDoc = await caseRef.get();

    if (!caseDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'Case not found'
        });
    }

    const currentData = caseDoc.data();
    const watchers = (currentData.watchers || []).filter(uid => uid !== req.user.uid);
    await caseRef.update({ watchers });

    res.json({
        success: true,
        message: 'You have stopped watching this case',
        data: { id, watching: false }
    });
});
