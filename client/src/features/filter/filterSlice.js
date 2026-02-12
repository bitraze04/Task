/**
 * Filter Slice
 * 
 * Manages filter state for the dashboard.
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    status: 'All',
    priority: '',
    search: ''
};

const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        setStatusFilter: (state, action) => {
            state.status = action.payload;
        },
        setPriorityFilter: (state, action) => {
            state.priority = action.payload;
        },
        setSearchFilter: (state, action) => {
            state.search = action.payload;
        },
        resetFilters: (state) => {
            state.status = 'All';
            state.priority = '';
            state.search = '';
        }
    }
});

export const { setStatusFilter, setPriorityFilter, setSearchFilter, resetFilters } = filterSlice.actions;
export default filterSlice.reducer;
