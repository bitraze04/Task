/**
 * Badge Component
 * 
 * Displays status and priority badges with appropriate colors.
 */

import clsx from 'clsx';

const Badge = ({ type, value, className = '' }) => {
    const statusStyles = {
        'Open': 'badge-open',
        'In Progress': 'badge-in-progress',
        'Closed': 'badge-closed'
    };

    const priorityStyles = {
        'Low': 'badge-low',
        'Medium': 'badge-medium',
        'High': 'badge-high'
    };

    const roleStyles = {
        'admin': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        'user': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
    };

    const styles = type === 'status'
        ? statusStyles[value]
        : type === 'priority'
            ? priorityStyles[value]
            : type === 'role'
                ? roleStyles[value]
                : '';

    return (
        <span className={clsx('badge', styles, className)}>
            {value}
        </span>
    );
};

export default Badge;
