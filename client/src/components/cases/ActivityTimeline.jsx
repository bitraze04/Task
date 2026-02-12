/**
 * ActivityTimeline Component
 * 
 * Displays chronological activity history for a case.
 * Vertical timeline UI with user avatars and timestamps.
 * Shows detailed change info for status, priority, and field edits.
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivities } from '../../features/activities/activitySlice';
import { formatRelativeTime } from '../../utils/formatters';
import {
    PlusCircleIcon,
    PencilIcon,
    ArrowPathIcon,
    ChatBubbleLeftIcon,
    UserPlusIcon,
    TrashIcon,
    ClockIcon,
    FlagIcon
} from '@heroicons/react/24/outline';

// Get icon based on activity type
const getActivityIcon = (type) => {
    switch (type) {
        case 'CASE_CREATED':
        case 'case_created':
            return PlusCircleIcon;
        case 'CASE_EDITED':
        case 'case_edited':
            return PencilIcon;
        case 'STATUS_CHANGED':
        case 'status_changed':
            return ArrowPathIcon;
        case 'PRIORITY_CHANGED':
        case 'priority_changed':
            return FlagIcon;
        case 'COMMENT_ADDED':
        case 'comment_added':
            return ChatBubbleLeftIcon;
        case 'ASSIGNED_USER_CHANGED':
        case 'assigned_user_changed':
            return UserPlusIcon;
        case 'CASE_DELETED':
        case 'case_deleted':
            return TrashIcon;
        default:
            return ClockIcon;
    }
};

// Get color based on activity type
const getActivityColor = (type) => {
    switch (type) {
        case 'CASE_CREATED':
        case 'case_created':
            return 'bg-green-500';
        case 'STATUS_CHANGED':
        case 'status_changed':
            return 'bg-blue-500';
        case 'PRIORITY_CHANGED':
        case 'priority_changed':
            return 'bg-orange-500';
        case 'COMMENT_ADDED':
        case 'comment_added':
            return 'bg-purple-500';
        case 'ASSIGNED_USER_CHANGED':
        case 'assigned_user_changed':
            return 'bg-amber-500';
        case 'CASE_EDITED':
        case 'case_edited':
            return 'bg-slate-500';
        case 'CASE_DELETED':
        case 'case_deleted':
            return 'bg-red-500';
        default:
            return 'bg-slate-400';
    }
};

// Status badge colors
const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'Open':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'In Progress':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        case 'Closed':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        default:
            return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
};

// Priority badge colors
const getPriorityBadgeClass = (priority) => {
    switch (priority) {
        case 'High':
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'Medium':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        case 'Low':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        default:
            return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
};

// Inline badge component for change details
const ChangeBadge = ({ value, className }) => (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${className}`}>
        {value}
    </span>
);

// Render detailed change info below the message
const ActivityChangeDetail = ({ activity }) => {
    const type = activity.type;
    const metadata = activity.metadata;

    if (!metadata) return null;

    // Status change: show old → new with colored badges
    if ((type === 'STATUS_CHANGED' || type === 'status_changed') && metadata.oldStatus && metadata.newStatus) {
        return (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <ChangeBadge value={metadata.oldStatus} className={getStatusBadgeClass(metadata.oldStatus)} />
                <span className="text-xs text-slate-400 dark:text-slate-500">→</span>
                <ChangeBadge value={metadata.newStatus} className={getStatusBadgeClass(metadata.newStatus)} />
            </div>
        );
    }

    // Priority change: show old → new with colored badges
    if ((type === 'PRIORITY_CHANGED' || type === 'priority_changed') && metadata.oldPriority && metadata.newPriority) {
        return (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <ChangeBadge value={metadata.oldPriority} className={getPriorityBadgeClass(metadata.oldPriority)} />
                <span className="text-xs text-slate-400 dark:text-slate-500">→</span>
                <ChangeBadge value={metadata.newPriority} className={getPriorityBadgeClass(metadata.newPriority)} />
            </div>
        );
    }

    // Case edited: show which fields changed
    if ((type === 'CASE_EDITED' || type === 'case_edited') && metadata.changedFields && metadata.changedFields.length > 0) {
        return (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {metadata.changedFields.map((field, i) => (
                    <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {field}
                    </span>
                ))}
            </div>
        );
    }

    return null;
};

// User avatar with initials
const UserAvatar = ({ name }) => {
    const initials = name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '??';

    return (
        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-medium text-primary-600 dark:text-primary-400">
            {initials}
        </div>
    );
};

const ActivityTimeline = ({ caseId }) => {
    const dispatch = useDispatch();
    const { activitiesByCaseId, isLoading } = useSelector(state => state.activities);
    const activities = activitiesByCaseId[caseId] || [];

    useEffect(() => {
        if (caseId) {
            dispatch(fetchActivities(caseId));
        }
    }, [caseId, dispatch]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <ClockIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activity recorded yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-0">
            {activities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const color = getActivityColor(activity.type);

                return (
                    <div key={activity.id} className="relative flex gap-4 pb-6 last:pb-0">
                        {/* Timeline line */}
                        {index !== activities.length - 1 && (
                            <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                        )}

                        {/* Icon */}
                        <div className={`relative z-10 w-8 h-8 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-4 h-4 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2">
                                <UserAvatar name={activity.performedByName} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        {activity.message}
                                    </p>
                                    {/* Detailed change badges */}
                                    <ActivityChangeDetail activity={activity} />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {formatRelativeTime(activity.timestamp || activity.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ActivityTimeline;
