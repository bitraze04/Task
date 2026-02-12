/**
 * UI Slice
 * 
 * Manages UI state like modals, toasts, and theme.
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    darkMode: localStorage.getItem('darkMode') === 'true',
    sidebarOpen: true,
    modal: {
        isOpen: false,
        type: null, // 'create' | 'edit' | 'delete'
        data: null
    },
    toasts: []
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleDarkMode: (state) => {
            state.darkMode = !state.darkMode;
            localStorage.setItem('darkMode', state.darkMode.toString());
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload;
        },
        openModal: (state, action) => {
            state.modal = {
                isOpen: true,
                type: action.payload.type,
                data: action.payload.data || null
            };
        },
        closeModal: (state) => {
            state.modal = {
                isOpen: false,
                type: null,
                data: null
            };
        },
        addToast: (state, action) => {
            state.toasts.push({
                id: Date.now(),
                type: action.payload.type || 'info', // 'success' | 'error' | 'warning' | 'info'
                message: action.payload.message,
                duration: action.payload.duration || 4000
            });
        },
        removeToast: (state, action) => {
            state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
        }
    }
});

export const {
    toggleDarkMode,
    toggleSidebar,
    setSidebarOpen,
    openModal,
    closeModal,
    addToast,
    removeToast
} = uiSlice.actions;
export default uiSlice.reducer;
