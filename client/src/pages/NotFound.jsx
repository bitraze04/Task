/**
 * NotFound Page (404)
 * 
 * Displayed for unknown routes.
 */

import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { HomeIcon, FolderIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
                {/* Animated 404 */}
                <div className="relative mb-8">
                    <div className="text-[150px] font-bold text-slate-200 dark:text-slate-800 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center animate-bounce">
                            <FolderIcon className="w-10 h-10 text-white" />
                        </div>
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Page not found
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                    Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
                </p>

                {/* Action */}
                <Link to="/">
                    <Button>
                        <HomeIcon className="w-5 h-5 mr-2" />
                        Go to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
