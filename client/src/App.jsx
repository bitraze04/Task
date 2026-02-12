/**
 * Main Application Component
 * 
 * Sets up routing, auth initialization, and error boundary.
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './features/auth/authSlice';

// Error Boundary
import ErrorBoundary from './components/ErrorBoundary';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AllCases from './pages/AllCases';
import CaseDetails from './pages/CaseDetails';
import UsersPage from './pages/UsersPage';
import UserDetails from './pages/UserDetails';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import MyTasks from './pages/MyTasks';
import NotFound from './pages/NotFound';

// Loading spinner
const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
    </div>
);

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
    const { user, isInitialized } = useSelector(state => state.auth);

    if (!isInitialized) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Admin Route wrapper
const AdminRoute = ({ children }) => {
    const { user, isInitialized } = useSelector(state => state.auth);

    if (!isInitialized) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    const dispatch = useDispatch();
    const { darkMode } = useSelector(state => state.ui);
    const { isInitialized } = useSelector(state => state.auth);

    // Initialize auth on mount
    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    // Apply dark mode class to document
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    if (!isInitialized) {
        return <LoadingScreen />;
    }

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Protected routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="cases" element={<AllCases />} />
                        <Route path="cases/:id" element={<CaseDetails />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="users/:uid" element={<UserDetails />} />
                        <Route path="my-tasks" element={<MyTasks />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="admin" element={
                            <AdminRoute>
                                <AdminPanel />
                            </AdminRoute>
                        } />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
