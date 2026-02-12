/**
 * UserDetails Page
 * 
 * Shows detailed user information and statistics.
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { updateUserRole } from '../features/auth/authSlice';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatDate, getInitials } from '../utils/formatters';
import {
    ArrowLeftIcon,
    UserIcon,
    EnvelopeIcon,
    CalendarIcon,
    FolderIcon,
    ClockIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const UserDetails = () => {
    const { uid } = useParams();
    const { user: currentUser, isAdmin } = useAuth();
    const dispatch = useDispatch();
    const toast = useToast();

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/auth/users/${uid}`);
                setUser(response.data.data);
            } catch (error) {
                toast.error('Failed to load user details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [uid]);

    const handleRoleChange = async () => {
        if (!user) return;
        const newRole = user.role === 'admin' ? 'user' : 'admin';

        setIsUpdating(true);
        try {
            await dispatch(updateUserRole({ uid, role: newRole })).unwrap();
            setUser(prev => ({ ...prev, role: newRole }));
            toast.success(`User role updated to ${newRole}`);
        } catch (error) {
            toast.error(error || 'Failed to update role');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                <LoadingSkeleton variant="text" width="200px" height="24px" />
                <div className="glass-card p-8">
                    <div className="flex items-center gap-6 mb-6">
                        <LoadingSkeleton variant="circle" width="80px" height="80px" />
                        <div className="flex-1 space-y-3">
                            <LoadingSkeleton variant="text" width="60%" height="28px" />
                            <LoadingSkeleton variant="text" width="40%" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <LoadingSkeleton variant="rect" height="100px" />
                        <LoadingSkeleton variant="rect" height="100px" />
                        <LoadingSkeleton variant="rect" height="100px" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <UserIcon className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">User not found</h2>
                <Link to="/users" className="text-primary-600 hover:text-primary-500 mt-2 inline-block">
                    Back to Users
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Back button */}
            <Link
                to="/users"
                className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Users
            </Link>

            {/* User Profile Card */}
            <div className="glass-card p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                            {getInitials(user.name)}
                        </div>

                        {/* Basic Info */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {user.name}
                                </h1>
                                <Badge type="role" value={user.role} />
                                {uid === currentUser?.uid && (
                                    <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                                        You
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <EnvelopeIcon className="w-4 h-4" />
                                <span>{user.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && uid !== currentUser?.uid && (
                        <Button
                            variant="secondary"
                            isLoading={isUpdating}
                            onClick={handleRoleChange}
                        >
                            {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                        </Button>
                    )}
                </div>

                {/* Date Joined */}
                <div className="flex items-center gap-3 mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-slate-400" />
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Date Joined</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                            {formatDate(user.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                    Case Statistics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Active Cases */}
                    <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-3 mb-2">
                            <ClockIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm text-emerald-700 dark:text-emerald-300">Active Cases</span>
                        </div>
                        <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                            {user.stats?.activeCases || 0}
                        </p>
                    </div>

                    {/* Assigned Cases */}
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3 mb-2">
                            <FolderIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-blue-700 dark:text-blue-300">Total Assigned</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                            {user.stats?.assignedCases || 0}
                        </p>
                    </div>

                    {/* Created Cases */}
                    <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircleIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm text-purple-700 dark:text-purple-300">Cases Created</span>
                        </div>
                        <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                            {user.stats?.createdCases || 0}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;
