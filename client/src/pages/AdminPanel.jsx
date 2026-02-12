/**
 * Admin Panel Page
 * 
 * User management for administrators.
 * Includes role management and granular permission management.
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUserRole } from '../features/auth/authSlice';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import UserPermissions from '../components/admin/UserPermissions';
import { getInitials } from '../utils/formatters';
import {
    UsersIcon,
    ShieldCheckIcon,
    UserIcon,
    KeyIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const AdminPanel = () => {
    const dispatch = useDispatch();
    const toast = useToast();
    const { user: currentUser } = useAuth();
    const { users, isLoading } = useSelector(state => state.auth);
    const [updatingUser, setUpdatingUser] = useState(null);
    const [permissionUser, setPermissionUser] = useState(null);

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    const handleRoleChange = async (uid, newRole) => {
        setUpdatingUser(uid);
        try {
            await dispatch(updateUserRole({ uid, role: newRole })).unwrap();
            toast.success(`User role updated to ${newRole}`);
        } catch (error) {
            toast.error(error || 'Failed to update role');
        } finally {
            setUpdatingUser(null);
        }
    };

    // Count permissions enabled for a user
    const getEnabledPermissionCount = (userPerms) => {
        if (!userPerms) return 0;
        return Object.values(userPerms).filter(v => v === true).length;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UsersIcon className="w-7 h-7" />
                    User Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Manage user roles and permissions
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-5">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{users.length}</p>
                </div>
                <div className="glass-card p-5">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Admins</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {users.filter(u => u.role === 'admin').length}
                    </p>
                </div>
                <div className="glass-card p-5">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Regular Users</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {users.filter(u => u.role === 'user').length}
                    </p>
                </div>
            </div>

            {/* Users table */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900 dark:text-white">All Users</h2>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <KeyIcon className="w-4 h-4" />
                        Click "Manage Permissions" to set granular access
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-4 space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <LoadingSkeleton key={i} preset="tableRow" />
                        ))}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {users.map(user => (
                            <div
                                key={user.uid}
                                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
                                            {getInitials(user.name)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {user.name}
                                                </span>
                                                {user.uid === currentUser?.uid && (
                                                    <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                                    {user.email}
                                                </span>
                                                {user.role === 'user' && (
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                                        • {getEnabledPermissionCount(user.permissions)} permission{getEnabledPermissionCount(user.permissions) !== 1 ? 's' : ''} enabled
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Badge type="role" value={user.role} />

                                        {/* Show permissions button for regular users */}
                                        {user.role === 'user' && user.uid !== currentUser?.uid && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setPermissionUser(user)}
                                            >
                                                <AdjustmentsHorizontalIcon className="w-4 h-4 mr-1.5" />
                                                Manage Permissions
                                            </Button>
                                        )}

                                        {user.uid !== currentUser?.uid && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                isLoading={updatingUser === user.uid}
                                                onClick={() => handleRoleChange(
                                                    user.uid,
                                                    user.role === 'admin' ? 'user' : 'admin'
                                                )}
                                            >
                                                {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Permission management modal */}
            {permissionUser && (
                <UserPermissions
                    user={permissionUser}
                    onClose={() => setPermissionUser(null)}
                />
            )}
        </div>
    );
};

export default AdminPanel;
