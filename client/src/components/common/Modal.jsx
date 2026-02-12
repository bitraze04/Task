/**
 * Modal Component
 * 
 * Reusable modal with backdrop fade and scale animation.
 * Uses only CSS transitions, no external libraries.
 */

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Animate in when opened
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // Small delay to trigger CSS transition
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsAnimating(true);
                });
            });
            document.body.style.overflow = 'hidden';
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setIsVisible(false), 200);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal content */}
            <div
                className={`relative w-full ${sizeClasses[size]} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[85vh] overflow-hidden flex flex-col transition-all duration-200 ${isAnimating ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.98]'}`}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="px-6 py-4 overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
