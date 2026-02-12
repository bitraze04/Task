/**
 * Dashboard Page
 * 
 * Main page with case list, stats, filter tabs, and quick actions.
 * Professional SaaS design with overdue cases sorted to top.
 */

import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCases } from '../features/cases/caseSlice';
import { useAuth } from '../hooks/useAuth';
import usePermissions from '../hooks/usePermissions';
import { PERMISSION_KEYS } from '../utils/permissions';
import CaseList from '../components/cases/CaseList';

// Check if case is overdue
const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'Closed') return false;
    return new Date(dueDate) < new Date();
};

// Minimal stat card without icons
const StatCard = ({ title, value, highlight = false }) => (
    <div className={`glass-card p-5 ${highlight ? 'ring-2 ring-red-400 dark:ring-red-500' : ''}`}>
        <p className={`text-sm ${highlight ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>{title}</p>
        <p className={`text-2xl font-semibold mt-1 ${highlight ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{value}</p>
    </div>
);

// Filter tabs component
const FILTER_TABS = [
    { id: 'all', label: 'All' },
    { id: 'Open', label: 'Open' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Closed', label: 'Closed' }
];

const Dashboard = () => {
    const dispatch = useDispatch();
    const { isAdmin } = useAuth();
    const { hasPermission } = usePermissions();
    const { cases, isLoading } = useSelector(state => state.cases);
    const [activeFilter, setActiveFilter] = useState('all');
    const canViewCases = hasPermission(PERMISSION_KEYS.VIEW_CASES);

    useEffect(() => {
        if (canViewCases) {
            dispatch(fetchCases());
        }
    }, [dispatch, canViewCases]);

    // Calculate stats including overdue count
    const stats = useMemo(() => ({
        total: cases.length,
        open: cases.filter(c => c.status === 'Open').length,
        inProgress: cases.filter(c => c.status === 'In Progress').length,
        closed: cases.filter(c => c.status === 'Closed').length,
        overdue: cases.filter(c => isOverdue(c.dueDate, c.status)).length
    }), [cases]);

    // Filter and sort cases - overdue cases appear at top
    const sortedCases = useMemo(() => {
        let filtered = cases;
        if (activeFilter !== 'all') {
            filtered = cases.filter(c => c.status === activeFilter);
        }

        // Sort: overdue first, then by created date
        return [...filtered].sort((a, b) => {
            const aOverdue = isOverdue(a.dueDate, a.status);
            const bOverdue = isOverdue(b.dueDate, b.status);

            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;

            // Then sort by creation date (newest first)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [cases, activeFilter]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-page-title text-slate-900 dark:text-white">Dashboard</h1>
                    <p className="text-body text-slate-500 dark:text-slate-400 mt-1">
                        {isAdmin ? 'Manage and track all cases' : 'View and comment on cases'}
                    </p>
                </div>
            </div>

            {/* Stats - Clean minimal design with overdue highlight */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <StatCard title="Total Cases" value={stats.total} />
                <StatCard title="Open" value={stats.open} />
                <StatCard title="In Progress" value={stats.inProgress} />
                <StatCard title="Closed" value={stats.closed} />
                {stats.overdue > 0 && (
                    <StatCard title="Overdue" value={stats.overdue} highlight />
                )}
            </div>

            {/* Cases Section */}
            <div className="glass-card">
                {/* Filter Tabs */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-section-title text-slate-900 dark:text-white">
                            Cases
                        </h2>
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            {FILTER_TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveFilter(tab.id)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${activeFilter === tab.id
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {tab.label}
                                    {tab.id !== 'all' && (
                                        <span className="ml-1.5 text-xs opacity-60">
                                            {tab.id === 'Open' ? stats.open : tab.id === 'In Progress' ? stats.inProgress : stats.closed}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Case List */}
                <div className="p-6">
                    <CaseList cases={sortedCases} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
