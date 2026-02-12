/**
 * ToastContainer Component
 * 
 * Displays toast notifications with slide-in/out animations.
 * Uses only CSS animations, no external libraries.
 */

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../features/ui/uiSlice';
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const icons = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
};

const colors = {
    success: 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    error: 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300',
    warning: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300',
    info: 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300'
};

const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-primary-500'
};

const Toast = ({ toast, onRemove }) => {
    const [isExiting, setIsExiting] = useState(false);
    const Icon = icons[toast.type] || icons.info;

    const handleRemove = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id), 250);
    }, [toast.id, onRemove]);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleRemove();
        }, toast.duration || 4000);

        return () => clearTimeout(timer);
    }, [toast.duration, handleRemove]);

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg backdrop-blur-sm max-w-sm w-full ${colors[toast.type] || colors.info} ${isExiting ? 'animate-toast-exit' : 'animate-toast-enter'}`}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[toast.type] || iconColors.info}`} />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
                onClick={handleRemove}
                className="flex-shrink-0 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
                <XMarkIcon className="w-4 h-4 opacity-60" />
            </button>
        </div>
    );
};

const ToastContainer = () => {
    const dispatch = useDispatch();
    const { toasts } = useSelector(state => state.ui);

    const handleRemove = useCallback((id) => {
        dispatch(removeToast(id));
    }, [dispatch]);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={handleRemove} />
            ))}
        </div>
    );
};

export default ToastContainer;
