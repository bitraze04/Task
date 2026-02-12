/**
 * Layout Component
 * 
 * Main application layout with sidebar, navbar, content area, and toasts.
 * Wraps page content with fade-in animation on route changes.
 */

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ToastContainer from '../common/ToastContainer';

const Layout = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    <div key={location.pathname} className="page-enter">
                        <Outlet />
                    </div>
                </main>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Layout;
