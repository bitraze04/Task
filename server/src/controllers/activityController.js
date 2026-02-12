/**
 * Activity Controller
 * 
 * Handles fetching activity timeline for cases.
 */

import { db } from '../config/firebase.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getActivities } from '../services/activityService.js';

/**
 * Get activities for a case
 * GET /api/cases/:id/activities
 * All authenticated users
 */
export const getCaseActivities = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verify case exists
    const caseDoc = await db.collection('cases').doc(id).get();
    if (!caseDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'Case not found'
        });
    }

    const activities = await getActivities(id);

    res.json({
        success: true,
        count: activities.length,
        data: activities
    });
});
