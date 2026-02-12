/**
 * Navbar Component
 * 
 * Top navigation bar with search, user profile, and dark mode toggle.
 * Professional SaaS styling.
 */

import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../features/auth/authSlice';
import { toggleDarkMode, toggleSidebar } from '../../features/ui/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';
import Badge from '../common/Badge';
import {
    Bars3Icon,
    SunIcon,
    MoonIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const { darkMode } = useSelector(state => state.ui);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/login');
    };

    return (
        <nav className="h-16 bg-white dark:bg-[#0B1220] border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between relative z-40">
            {/* Left side */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => dispatch(toggleSidebar())}
                    className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <Bars3Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Dark mode toggle */}
                <button
                    onClick={() => dispatch(toggleDarkMode())}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    {darkMode ? (
                        <SunIcon className="w-5 h-5 text-amber-500" />
                    ) : (
                        <MoonIcon className="w-5 h-5 text-slate-500" />
                    )}
                </button>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                            {getInitials(user?.name)}
                        </div>
                        <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {user?.name}
                        </span>
                        <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-dropdown border border-slate-200 dark:border-slate-700 py-2 animate-slide-down z-[100]">
                            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {user?.email}
                                </p>
                                <Badge type="role" value={user?.role} className="mt-2" />
                            </div>

                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        navigate('/profile');
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
                                >
                                    <UserCircleIcon className="w-4 h-4" />
                                    Profile Settings
                                </button>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-700 pt-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                                >
                                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

