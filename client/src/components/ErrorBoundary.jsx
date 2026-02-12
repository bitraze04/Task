/**
 * Error Boundary Component
 * 
 * Catches React errors and displays a friendly error page
 * with options to reload or go to dashboard.
 */

import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        // Log error to console (could send to logging service)
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center">
                        {/* Error Icon */}
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <ExclamationTriangleIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </div>

                        {/* Message */}
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            We encountered an unexpected error. Don't worry, your data is safe.
                            Please try reloading the page or return to the dashboard.
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                                Reload Page
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors"
                            >
                                <HomeIcon className="w-5 h-5" />
                                Go to Dashboard
                            </button>
                        </div>

                        {/* Error details (collapsible in dev) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-8 text-left">
                                <summary className="cursor-pointer text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                                    Show error details
                                </summary>
                                <pre className="mt-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-red-600 dark:text-red-400 overflow-auto max-h-48">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
