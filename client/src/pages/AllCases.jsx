/**
 * AllCases Page
 * 
 * Displays all cases in a table format with detailed columns and sorting.
 */

import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCases } from '../features/cases/caseSlice';
import { openModal } from '../features/ui/uiSlice';
import { useAuth } from '../hooks/useAuth';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import CaseForm from '../components/cases/CaseForm';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import {
    PlusIcon,
    FolderIcon,
    EyeIcon,
    FunnelIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// Sort options configuration
const SORT_OPTIONS = [
    { value: 'priority-desc', label: 'Priority (High → Low)' },
    { value: 'priority-asc', label: 'Priority (Low → High)' },
    { value: 'updated-desc', label: 'Updated (Latest)' },
    { value: 'updated-asc', label: 'Updated (Oldest)' },
    { value: 'created-desc', label: 'Created (Latest)' },
    { value: 'created-asc', label: 'Created (Oldest)' },
    { value: 'assignedTo-asc', label: 'Assigned To (A → Z)' },
    { value: 'assignedTo-desc', label: 'Assigned To (Z → A)' },
    { value: 'status-asc', label: 'Status (Open → Closed)' },
    { value: 'status-desc', label: 'Status (Closed → Open)' }
];

// Priority order mapping
const PRIORITY_ORDER = { 'High': 3, 'Medium': 2, 'Low': 1 };
// Status order mapping
const STATUS_ORDER = { 'Open': 1, 'In Progress': 2, 'Closed': 3 };

const AllCases = () => {
    const dispatch = useDispatch();
    const { isAdmin } = useAuth();
    const { cases, isLoading } = useSelector(state => state.cases);
    const [sortBy, setSortBy] = useState('created-desc');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchCases());
    }, [dispatch]);

    // Sort cases based on selected option
    const sortedCases = useMemo(() => {
        if (!cases.length) return cases;

        const [field, direction] = sortBy.split('-');
        const sorted = [...cases].sort((a, b) => {
            let comparison = 0;

            switch (field) {
                case 'priority':
                    comparison = (PRIORITY_ORDER[a.priority] || 0) - (PRIORITY_ORDER[b.priority] || 0);
                    break;
                case 'status':
                    comparison = (STATUS_ORDER[a.status] || 0) - (STATUS_ORDER[b.status] || 0);
                    break;
                case 'updated':
                    comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
                    break;
                case 'created':
                    comparison = new Date(a.createdAt) - new Date(b.createdAt);
                    break;
                case 'assignedTo':
                    const nameA = (a.assignedToName || '').toLowerCase();
                    const nameB = (b.assignedToName || '').toLowerCase();
                    comparison = nameA.localeCompare(nameB);
                    break;
                default:
                    comparison = 0;
            }

            return direction === 'desc' ? -comparison : comparison;
        });

        return sorted;
    }, [cases, sortBy]);

    // Filter cases based on search query
    const filteredCases = useMemo(() => {
        if (!searchQuery.trim()) return sortedCases;
        const query = searchQuery.toLowerCase();
        return sortedCases.filter(c =>
            c.title?.toLowerCase().includes(query) ||
            c.description?.toLowerCase().includes(query) ||
            c.createdByName?.toLowerCase().includes(query) ||
            c.assignedToName?.toLowerCase().includes(query)
        );
    }, [sortedCases, searchQuery]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FolderIcon className="w-7 h-7" />
                        All Cases
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {filteredCases.length} of {cases.length} case{cases.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search bar */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search cases..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <div className="flex items-center gap-2">
                            <FunnelIcon className="w-4 h-4 text-slate-500" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                {SORT_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    {isAdmin && (
                        <Button onClick={() => dispatch(openModal({ type: 'create' }))}>
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Create Case
                        </Button>
                    )}
                </div>
            </div>

            {/* Cases Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Priority
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Created By
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Assigned To
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Updated
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><LoadingSkeleton variant="text" width="150px" /></td>
                                        <td className="px-6 py-4"><LoadingSkeleton variant="rect" width="80px" height="24px" /></td>
                                        <td className="px-6 py-4"><LoadingSkeleton variant="rect" width="60px" height="24px" /></td>
                                        <td className="px-6 py-4"><LoadingSkeleton variant="text" width="100px" /></td>
                                        <td className="px-6 py-4"><LoadingSkeleton variant="text" width="100px" /></td>
                                        <td className="px-6 py-4"><LoadingSkeleton variant="text" width="80px" /></td>
                                        <td className="px-6 py-4"><LoadingSkeleton variant="text" width="80px" /></td>
                                        <td className="px-6 py-4"><LoadingSkeleton variant="rect" width="60px" height="32px" /></td>
                                    </tr>
                                ))
                            ) : filteredCases.length > 0 ? (
                                filteredCases.map(caseItem => (
                                    <tr
                                        key={caseItem.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/cases/${caseItem.id}`}
                                                className="font-medium text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                                            >
                                                {caseItem.title}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge type="status" value={caseItem.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge type="priority" value={caseItem.priority} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {caseItem.createdByName || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {caseItem.assignedToName || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {formatRelativeTime(caseItem.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {formatRelativeTime(caseItem.updatedAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/cases/${caseItem.id}`}>
                                                <Button variant="secondary" size="sm">
                                                    <EyeIcon className="w-4 h-4 mr-1" />
                                                    View
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <FolderIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                                        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            No cases found
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                            Get started by creating your first case
                                        </p>
                                        {isAdmin && (
                                            <Button onClick={() => dispatch(openModal({ type: 'create' }))}>
                                                <PlusIcon className="w-5 h-5 mr-2" />
                                                Create Case
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Case Form Modal */}
            <CaseForm />
        </div>
    );
};

export default AllCases;

