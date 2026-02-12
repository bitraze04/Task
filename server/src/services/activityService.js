/**
 * Activity Service
 * 
 * Manages activity timeline entries for cases.
 */

import { db } from '../config/firebase.js';

// Activity types enum
export const ActivityTypes = {
    CASE_CREATED: 'case_created',
    CASE_EDITED: 'case_edited',
    STATUS_CHANGED: 'status_changed',
    PRIORITY_CHANGED: 'priority_changed',
    ASSIGNED_USER_CHANGED: 'assigned_user_changed',
    COMMENT_ADDED: 'comment_added',
    CASE_DELETED: 'case_deleted'
};

/**
 * Generate a human-readable activity message
 */
export const generateActivityMessage = (type, userName, details = {}) => {
    switch (type) {
        case ActivityTypes.CASE_CREATED:
            return `${userName} created this case`;
        case ActivityTypes.CASE_EDITED: {
            const fields = details.changedFields;
            if (fields && fields.length > 0) {
                return `${userName} updated ${fields.join(', ')}`;
            }
            return `${userName} edited this case`;
        }
        case ActivityTypes.STATUS_CHANGED:
            if (details.oldStatus && details.newStatus) {
                return `${userName} changed status from ${details.oldStatus} to ${details.newStatus}`;
            }
            return `${userName} changed status to ${details.newStatus || 'unknown'}`;
        case ActivityTypes.PRIORITY_CHANGED:
            if (details.oldPriority && details.newPriority) {
                return `${userName} changed priority from ${details.oldPriority} to ${details.newPriority}`;
            }
            return `${userName} changed priority to ${details.newPriority || 'unknown'}`;
        case ActivityTypes.ASSIGNED_USER_CHANGED:
            return details.assignedToName
                ? `${userName} assigned this case to ${details.assignedToName}`
                : `${userName} unassigned this case`;
        case ActivityTypes.COMMENT_ADDED:
            return `${userName} added a comment`;
        case ActivityTypes.CASE_DELETED:
            return `${userName} deleted this case`;
        default:
            return `${userName} performed an action`;
    }
};

/**
 * Create an activity entry for a case
 */
export const createActivity = async (caseId, activityData) => {
    const activity = {
        ...activityData,
        caseId,
        createdAt: new Date().toISOString()
    };

    await db.collection('cases').doc(caseId)
        .collection('activities').add(activity);

    return activity;
};

/**
 * Get all activities for a case, sorted by newest first
 */
export const getActivities = async (caseId) => {
    const snapshot = await db.collection('cases').doc(caseId)
        .collection('activities')
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};
