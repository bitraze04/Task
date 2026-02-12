/**
 * CaseCard Component
 * 
 * Card display for a single case with hover lift and border distinction.
 * Includes overdue indicator for past-due cases.
 */

import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { formatRelativeTime, truncateText } from '../../utils/formatters';
import {
    ClockIcon,
    UserIcon,
    ChevronRightIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Check if case is overdue
const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'Closed') return false;
    return new Date(dueDate) < new Date();
};

// Format due date for display
const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CaseCard = ({ caseItem, style }) => {
    const overdue = isOverdue(caseItem.dueDate, caseItem.status);

    return (
        <Link
            to={`/cases/${caseItem.id}`}
            className={`glass-card-hover p-5 block group ${overdue ? 'ring-2 ring-red-400 dark:ring-red-500' : ''}`}
            style={style}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-150">
                        {caseItem.title}
                    </h3>
                    {overdue && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            <ExclamationTriangleIcon className="w-3 h-3" />
                            OVERDUE
                        </span>
                    )}
                </div>
                <Badge type="status" value={caseItem.status} />
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {truncateText(caseItem.description, 120)}
            </p>

            {/* Meta info */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        <span>{formatRelativeTime(caseItem.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>{caseItem.createdByName || 'Unknown'}</span>
                    </div>

                    {caseItem.dueDate && (
                        <div className={`flex items-center gap-1 ${overdue ? 'text-red-500' : ''}`}>
                            <span>Due: {formatDueDate(caseItem.dueDate)}</span>
                        </div>
                    )}
                </div>

                <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all duration-150" />
            </div>
        </Link>
    );
};

export default CaseCard;
