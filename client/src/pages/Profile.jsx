/**
 * Profile Page
 * 
 * Allows users with profile_management permission to update their account info.
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../hooks/useToast';
import usePermissions from '../hooks/usePermissions';
import { PERMISSION_KEYS, PERMISSIONS } from '../utils/permissions';
import api from '../services/api';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { getInitials, formatDate } from '../utils/formatters';
import {
    UserCircleIcon,
    EnvelopeIcon,
    ShieldCheckIcon,
    KeyIcon,
    CheckCircleIcon,
    XCircleIcon,
    CalendarIcon,
    IdentificationIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
    const dispatch = useDispatch();
    const toast = useToast();
    const { user } = useSelector(state => state.auth);
    const { isAdmin, permissions } = usePermissions();

    const [name, setName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Name is required');
            return;
        }
        setIsSaving(true);
        try {
            await api.patch('/auth/profile', { name: name.trim() });
            toast.success('Profile updated successfully');
            // Refresh page to update name in state
            window.location.reload();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    // Get enabled permissions for display
    const enabledPermissions = PERMISSIONS.filter(p => permissions[p.key] === true);
    const disabledPermissions = PERMISSIONS.filter(p => permissions[p.key] !== true);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCircleIcon className="w-7 h-7" />
                    My Profile
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Manage your account information
                </p>
            </div>

            {/* Profile card */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/25">
                        {getInitials(user?.name)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</span>
                        </div>
                        <div className="mt-2">
                            <Badge type="role" value={user?.role} />
                        </div>
                    </div>
                </div>

                {/* Personal Details Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Date Joined</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <EnvelopeIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Email Address</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ShieldCheckIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Account Role</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                                {user?.role}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <IdentificationIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">User ID</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white font-mono truncate max-w-[200px]" title={user?.uid}>
                                {user?.uid ? `${user.uid.slice(0, 12)}...` : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            placeholder="Your display name"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" variant="primary" isLoading={isSaving}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>

            {/* Permissions overview (for regular users) */}
            {!isAdmin && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <KeyIcon className="w-5 h-5" />
                        My Permissions
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        These permissions are managed by your administrator.
                    </p>

                    <div className="space-y-2">
                        {PERMISSIONS.map(perm => {
                            const isEnabled = permissions[perm.key] === true;
                            return (
                                <div
                                    key={perm.key}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${isEnabled
                                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{perm.icon}</span>
                                        <div>
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                {perm.label}
                                            </span>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {perm.description}
                                            </p>
                                        </div>
                                    </div>
                                    {isEnabled ? (
                                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    ) : (
                                        <XCircleIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
