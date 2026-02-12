/**
 * My Tasks Page
 * 
 * Shows cases assigned to the current user.
 */

import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCases } from '../features/cases/caseSlice';
import { useAuth } from '../hooks/useAuth';
import CaseList from '../components/cases/CaseList';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const MyTasks = () => {
    const dispatch = useDispatch();
    const { user } = useAuth();
    const { cases, isLoading } = useSelector(state => state.cases);

    useEffect(() => {
        dispatch(fetchCases());
    }, [dispatch]);

    // Filter cases assigned to current user
    const myTasks = useMemo(() => {
        if (!user) return [];
        return cases.filter(c => c.assignedTo === user.uid);
    }, [cases, user]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-page-title text-slate-900 dark:text-white flex items-center gap-2">
                    <ClipboardDocumentListIcon className="w-7 h-7" />
                    My Tasks
                </h1>
                <p className="text-body text-slate-500 dark:text-slate-400 mt-1">
                    Cases assigned to you
                </p>
            </div>

            {/* Task List */}
            <div className="glass-card p-6">
                {myTasks.length === 0 && !isLoading ? (
                    <div className="text-center py-12">
                        <ClipboardDocumentListIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            No tasks assigned
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            You don't have any cases assigned to you yet.
                        </p>
                    </div>
                ) : (
                    <CaseList cases={myTasks} isLoading={isLoading} />
                )}
            </div>
        </div>
    );
};

export default MyTasks;
