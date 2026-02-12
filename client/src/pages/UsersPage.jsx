/**
 * Users Page
 * 
 * Displays all registered users.
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUsers } from '../features/auth/authSlice';
import Badge from '../components/common/Badge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { getInitials, formatDate } from '../utils/formatters';
import {
    UsersIcon,
    EnvelopeIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

const UsersPage = () => {
    const dispatch = useDispatch();
    const { users, isLoading } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UsersIcon className="w-7 h-7" />
                    Users
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    {users.length} registered user{users.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="glass-card p-6">
                            <div className="flex items-center gap-4">
                                <LoadingSkeleton variant="circle" width="48px" height="48px" />
                                <div className="flex-1 space-y-2">
                                    <LoadingSkeleton variant="text" width="60%" />
                                    <LoadingSkeleton variant="text" width="80%" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : users.length > 0 ? (
                    users.map(user => (
                        <Link
                            key={user.uid}
                            to={`/users/${user.uid}`}
                            className="glass-card-hover p-6 block group"
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                                    {getInitials(user.name)}
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {user.name}
                                        </h3>
                                        <Badge type="role" value={user.role} />
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                        <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full glass-card p-12 text-center">
                        <UsersIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                            No users found
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Users will appear here after they register
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersPage;
