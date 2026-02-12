/**
 * PermissionConfirmModal Component
 * 
 * Confirmation dialog shown before saving permission changes.
 * Displays a summary of what's being enabled/disabled.
 */

import Button from '../common/Button';
import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

const PermissionConfirmModal = ({ changes, userName, onConfirm, onCancel, isLoading }) => {
    const enabling = changes.filter(c => c.to === true);
    const disabling = changes.filter(c => c.to === false);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700">
                {/* Header */}
                <div className="flex items-center gap-3 p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Confirm Permission Changes
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            You are about to modify permissions for <strong>{userName}</strong>
                        </p>
                    </div>
                </div>

                {/* Changes summary */}
                <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
                    {enabling.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1.5">
                                <CheckCircleIcon className="w-4 h-4" />
                                Enabling ({enabling.length})
                            </h4>
                            <div className="space-y-2">
                                {enabling.map(change => (
                                    <div
                                        key={change.key}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
                                    >
                                        <span className="text-lg">{change.icon}</span>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {change.label}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {change.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {disabling.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5">
                                <XCircleIcon className="w-4 h-4" />
                                Disabling ({disabling.length})
                            </h4>
                            <div className="space-y-2">
                                {disabling.map(change => (
                                    <div
                                        key={change.key}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                                    >
                                        <span className="text-lg">{change.icon}</span>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {change.label}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                User will lose: {change.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                    <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        Confirm Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PermissionConfirmModal;
