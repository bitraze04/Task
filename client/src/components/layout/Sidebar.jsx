/**
 * Sidebar Component
 * 
 * Navigation sidebar with professional SaaS styling.
 * Responsive with collapsible behavior on mobile.
 */

import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar, openModal } from '../../features/ui/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSION_KEYS } from '../../utils/permissions';
import {
    HomeIcon,
    FolderIcon,
    PlusCircleIcon,
    UsersIcon,
    ShieldCheckIcon,
    XMarkIcon,
    ClipboardDocumentListIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const Sidebar = () => {
    const dispatch = useDispatch();
    const { sidebarOpen } = useSelector(state => state.ui);
    const { isAdmin } = useAuth();
    const { hasPermission } = usePermissions();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: HomeIcon, end: true },
        ...(hasPermission(PERMISSION_KEYS.VIEW_CASES) ? [
            { name: 'All Cases', path: '/cases', icon: FolderIcon },
            { name: 'My Tasks', path: '/my-tasks', icon: ClipboardDocumentListIcon }
        ] : []),
        { name: 'Users', path: '/users', icon: UsersIcon },
        ...(hasPermission(PERMISSION_KEYS.PROFILE_MANAGEMENT) ? [
            { name: 'Profile', path: '/profile', icon: UserCircleIcon }
        ] : []),
        ...(isAdmin ? [{ name: 'Admin Panel', path: '/admin', icon: ShieldCheckIcon }] : [])
    ];

    const handleClick = (item) => {
        if (item.action === 'create') {
            dispatch(openModal({ type: 'create' }));
        }
        // Close sidebar on mobile after click
        if (window.innerWidth < 1024) {
            dispatch(toggleSidebar());
        }
    };

    const NavItem = ({ item }) => {
        if (item.action) {
            return (
                <button
                    onClick={() => handleClick(item)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                </button>
            );
        }

        return (
            <NavLink
                to={item.path}
                end={item.end}
                onClick={() => handleClick(item)}
                className={({ isActive }) =>
                    clsx(
                        'relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                        isActive
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    )
                }
            >
                {({ isActive }) => (
                    <>
                        {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
                        )}
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.name}</span>
                    </>
                )}
            </NavLink>
        );
    };

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => dispatch(toggleSidebar())}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    'fixed lg:static inset-y-0 left-0 z-50',
                    'w-64 bg-white dark:bg-[#020617]',
                    'border-r border-slate-200 dark:border-slate-800',
                    'transform transition-transform duration-200 ease-out',
                    'flex flex-col',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 dark:border-slate-800">
                    <NavLink to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <FolderIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">CaseTrack</span>
                    </NavLink>
                    <button
                        onClick={() => dispatch(toggleSidebar())}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <XMarkIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item, index) => (
                        <NavItem key={item.path || item.action || index} item={item} />
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                        CaseTrack v1.0
                    </p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;


