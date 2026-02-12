/**
 * CaseDetails Page
 * 
 * Single case view with full details, comments, and activity timeline.
 */

import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCaseById, fetchComments, deleteCase, clearSelectedCase } from '../features/cases/caseSlice';
import { openModal } from '../features/ui/uiSlice';
import { useAuth } from '../hooks/useAuth';
import usePermissions from '../hooks/usePermissions';
import { PERMISSION_KEYS } from '../utils/permissions';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import CommentSection from '../components/cases/CommentSection';
import ActivityTimeline from '../components/cases/ActivityTimeline';
import CaseForm from '../components/cases/CaseForm';
import { formatDate } from '../utils/formatters';
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    CalendarIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    HandRaisedIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

// Check if case is overdue
const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'Closed') return false;
    return new Date(dueDate) < new Date();
};

const CaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const toast = useToast();
    const { isAdmin, user } = useAuth();
    const { hasPermission } = usePermissions();
    const { selectedCase, comments, isLoading, isCommentsLoading } = useSelector(state => state.cases);

    useEffect(() => {
        dispatch(fetchCaseById(id));
        dispatch(fetchComments(id));

        return () => {
            dispatch(clearSelectedCase());
        };
    }, [dispatch, id]);

    const handleEdit = () => {
        dispatch(openModal({ type: 'edit', data: selectedCase }));
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
            try {
                await dispatch(deleteCase(id)).unwrap();
                toast.success('Case deleted successfully');
                navigate('/');
            } catch (error) {
                toast.error(error || 'Failed to delete case');
            }
        }
    };

    const handleTakeTask = async () => {
        try {
            await api.patch(`/cases/${id}/take`);
            toast.success('You have taken this task');
            dispatch(fetchCaseById(id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to take task');
        }
    };

    const handleWatch = async () => {
        try {
            await api.patch(`/cases/${id}/watch`);
            toast.success('You are now watching this case');
            dispatch(fetchCaseById(id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to watch case');
        }
    };

    const handleUnwatch = async () => {
        try {
            await api.patch(`/cases/${id}/unwatch`);
            toast.success('You have stopped watching this case');
            dispatch(fetchCaseById(id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to unwatch case');
        }
    };

    const isOwnCase = selectedCase?.createdBy === user?.uid;
    const canEditOwnCase = hasPermission(PERMISSION_KEYS.EDIT_OWN_CASES) && isOwnCase;
    const canTakeTask = hasPermission(PERMISSION_KEYS.ASSIGN_TO_SELF) && !selectedCase?.assignedTo;
    const canWatch = hasPermission(PERMISSION_KEYS.WATCH_CASE);
    const isWatching = selectedCase?.watchers?.includes(user?.uid);

    const overdue = selectedCase ? isOverdue(selectedCase.dueDate, selectedCase.status) : false;

    if (isLoading || !selectedCase) {
        return (
            <div className="space-y-6">
                <LoadingSkeleton variant="rect" height="40px" width="200px" />
                <div className="glass-card p-6 space-y-4">
                    <LoadingSkeleton variant="text" height="32px" width="60%" />
                    <LoadingSkeleton variant="text" count={4} className="mb-2" />
                    <div className="flex gap-4">
                        <LoadingSkeleton variant="rect" width="100px" height="24px" />
                        <LoadingSkeleton variant="rect" width="100px" height="24px" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back button */}
            <Link
                to="/"
                className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Dashboard
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content - 2/3 */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Case details card */}
                    <div className={`glass-card p-6 ${overdue ? 'ring-2 ring-red-400 dark:ring-red-500' : ''}`}>
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {selectedCase.title}
                                    </h1>
                                    <Badge type="status" value={selectedCase.status} />
                                    {overdue && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                            <ExclamationTriangleIcon className="w-3 h-3" />
                                            OVERDUE
                                        </span>
                                    )}
                                </div>
                                <Badge type="priority" value={selectedCase.priority} />
                            </div>

                            {/* Action buttons - permission-based */}
                            <div className="flex gap-2 flex-wrap">
                                {/* Admin OR edit_own_cases: Edit button */}
                                {(isAdmin || canEditOwnCase) && (
                                    <Button variant="secondary" onClick={handleEdit}>
                                        <PencilIcon className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                )}

                                {/* Admin only: Delete */}
                                {isAdmin && (
                                    <Button variant="danger" onClick={handleDelete}>
                                        <TrashIcon className="w-4 h-4 mr-2" />
                                        Delete
                                    </Button>
                                )}

                                {/* assign_to_self: Take Task (only unassigned) */}
                                {!isAdmin && canTakeTask && (
                                    <Button variant="primary" onClick={handleTakeTask}>
                                        <HandRaisedIcon className="w-4 h-4 mr-2" />
                                        Take Task
                                    </Button>
                                )}

                                {/* watch_case: Watch/Unwatch */}
                                {canWatch && (
                                    <Button
                                        variant="secondary"
                                        onClick={isWatching ? handleUnwatch : handleWatch}
                                    >
                                        {isWatching ? (
                                            <><EyeSlashIcon className="w-4 h-4 mr-2" />Unwatch</>
                                        ) : (
                                            <><EyeIcon className="w-4 h-4 mr-2" />Watch</>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                                Description
                            </h3>
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                {selectedCase.description}
                            </p>
                        </div>

                        {/* Meta info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <UserIcon className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Created by</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                        {selectedCase.createdByName}
                                    </p>
                                </div>
                            </div>

                            {selectedCase.assignedToName && (
                                <div className="flex items-center gap-3">
                                    <UserIcon className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Assigned to</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            {selectedCase.assignedToName}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <CalendarIcon className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Created</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                        {formatDate(selectedCase.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {selectedCase.dueDate && (
                                <div className="flex items-center gap-3">
                                    <ClockIcon className={`w-5 h-5 ${overdue ? 'text-red-500' : 'text-slate-400'}`} />
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Due Date</p>
                                        <p className={`text-sm font-medium ${overdue ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                                            {formatDate(selectedCase.dueDate)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <CalendarIcon className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Updated</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                        {formatDate(selectedCase.updatedAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comments section */}
                    <CommentSection caseId={id} comments={comments} isLoading={isCommentsLoading} />
                </div>

                {/* Sidebar - 1/3 */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-6 sticky top-24">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Activity Timeline
                        </h3>
                        <ActivityTimeline caseId={id} />
                    </div>
                </div>
            </div>

            {/* Edit modal */}
            <CaseForm />
        </div>
    );
};

export default CaseDetails;
