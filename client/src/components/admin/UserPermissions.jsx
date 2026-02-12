/**
 * UserPermissions Component
 * 
 * Full-screen modal for managing a single user's permissions.
 * Each permission has a description panel that must be reviewed before the toggle activates.
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserPermissions, updateUserPermissions } from '../../features/auth/authSlice';
import { useToast } from '../../hooks/useToast';
import { PERMISSIONS, getDefaultPermissions } from '../../utils/permissions';
import Button from '../common/Button';
import PermissionConfirmModal from './PermissionConfirmModal';
import {
    XMarkIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

const UserPermissions = ({ user, onClose }) => {
    const dispatch = useDispatch();
    const toast = useToast();
    const { targetUserPermissions } = useSelector(state => state.auth);

    const [localPermissions, setLocalPermissions] = useState({});
    const [reviewedPermissions, setReviewedPermissions] = useState(new Set());
    const [expandedPermission, setExpandedPermission] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch permissions on mount
    useEffect(() => {
        const loadPermissions = async () => {
            setIsLoading(true);
            try {
                await dispatch(fetchUserPermissions(user.uid)).unwrap();
            } catch (error) {
                toast.error(error || 'Failed to load permissions');
            } finally {
                setIsLoading(false);
            }
        };
        loadPermissions();
    }, [dispatch, user.uid]);

    // Initialize local state when permissions load
    useEffect(() => {
        if (targetUserPermissions?.permissions) {
            const defaults = getDefaultPermissions();
            setLocalPermissions({ ...defaults, ...targetUserPermissions.permissions });
            // Mark already-enabled permissions as reviewed
            const alreadyEnabled = new Set();
            Object.entries(targetUserPermissions.permissions).forEach(([key, value]) => {
                if (value) alreadyEnabled.add(key);
            });
            setReviewedPermissions(alreadyEnabled);
        }
    }, [targetUserPermissions]);

    const originalPermissions = targetUserPermissions?.permissions || getDefaultPermissions();

    // Calculate changes
    const getChanges = () => {
        const changes = [];
        PERMISSIONS.forEach(perm => {
            const original = originalPermissions[perm.key] || false;
            const current = localPermissions[perm.key] || false;
            if (original !== current) {
                changes.push({
                    key: perm.key,
                    label: perm.label,
                    icon: perm.icon,
                    description: perm.description,
                    from: original,
                    to: current
                });
            }
        });
        return changes;
    };

    const hasChanges = getChanges().length > 0;

    const handleToggle = (permKey) => {
        if (!reviewedPermissions.has(permKey)) return;
        setLocalPermissions(prev => ({
            ...prev,
            [permKey]: !prev[permKey]
        }));
    };

    const handleReview = (permKey) => {
        setExpandedPermission(expandedPermission === permKey ? null : permKey);
        setReviewedPermissions(prev => new Set([...prev, permKey]));
    };

    const handleSave = () => {
        if (!hasChanges) return;
        setShowConfirmModal(true);
    };

    const handleConfirm = async () => {
        setIsSaving(true);
        try {
            const changedPermissions = {};
            getChanges().forEach(change => {
                changedPermissions[change.key] = change.to;
            });
            await dispatch(updateUserPermissions({
                uid: user.uid,
                permissions: changedPermissions
            })).unwrap();
            toast.success('Permissions updated successfully');
            setShowConfirmModal(false);
            onClose();
        } catch (error) {
            toast.error(error || 'Failed to update permissions');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading permissions...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                <ShieldCheckIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    User Permissions
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {user.name} — {user.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Info banner */}
                    <div className="px-6 pt-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Review each permission's description before enabling it. Click "Review Details" to understand what access is being granted, then use the toggle to enable or disable.
                            </p>
                        </div>
                    </div>

                    {/* Permission list */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-3">
                        {PERMISSIONS.map(perm => {
                            const isExpanded = expandedPermission === perm.key;
                            const isReviewed = reviewedPermissions.has(perm.key);
                            const isEnabled = localPermissions[perm.key] || false;
                            const wasChanged = (originalPermissions[perm.key] || false) !== isEnabled;

                            return (
                                <div
                                    key={perm.key}
                                    className={`rounded-xl border transition-all duration-200 ${wasChanged
                                        ? 'border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-900/10'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'
                                        }`}
                                >
                                    {/* Permission header */}
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                                                    {perm.label}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                    {perm.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            {/* Review button */}
                                            <button
                                                onClick={() => handleReview(perm.key)}
                                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${isReviewed
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 animate-pulse'
                                                    }`}
                                            >
                                                {isReviewed ? '✓ Reviewed' : 'Review Details'}
                                            </button>

                                            {/* Toggle */}
                                            <button
                                                onClick={() => handleToggle(perm.key)}
                                                disabled={!isReviewed}
                                                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${!isReviewed
                                                    ? 'bg-slate-200 dark:bg-slate-700 opacity-40 cursor-not-allowed'
                                                    : isEnabled
                                                        ? 'bg-green-500 shadow-lg shadow-green-500/25'
                                                        : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                                                    }`}
                                                title={!isReviewed ? 'Review this permission first' : (isEnabled ? 'Disable' : 'Enable')}
                                            >
                                                <span
                                                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${isEnabled ? 'translate-x-6' : 'translate-x-0'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded details */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 mt-0 pt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* What user CAN do */}
                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                                        What User Can Do
                                                    </h4>
                                                    <ul className="space-y-1">
                                                        {perm.canDo.map((item, i) => (
                                                            <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                                                                <span className="mt-0.5">•</span>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* What user CANNOT do */}
                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                                        What User Cannot Do
                                                    </h4>
                                                    <ul className="space-y-1">
                                                        {perm.cannotDo.map((item, i) => (
                                                            <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                                                                <span className="mt-0.5">•</span>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* System effect */}
                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                                        System Effect
                                                    </h4>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                                        {perm.systemEffect}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {getChanges().length > 0 ? (
                                <span className="text-primary-600 dark:text-primary-400 font-medium">
                                    {getChanges().length} change{getChanges().length > 1 ? 's' : ''} pending
                                </span>
                            ) : (
                                'No changes'
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                disabled={!hasChanges}
                            >
                                Save Permissions
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation modal */}
            {showConfirmModal && (
                <PermissionConfirmModal
                    changes={getChanges()}
                    userName={user.name}
                    onConfirm={handleConfirm}
                    onCancel={() => setShowConfirmModal(false)}
                    isLoading={isSaving}
                />
            )}
        </>
    );
};

export default UserPermissions;
