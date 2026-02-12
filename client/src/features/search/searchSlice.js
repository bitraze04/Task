/**
 * Search Slice
 * 
 * Redux slice for global search functionality with debounce.
 */

import { createSlice } from '@reduxjs/toolkit';

const searchSlice = createSlice({
    name: 'search',
    initialState: {
        query: '',
        isSearching: false
    },
    reducers: {
        setSearchQuery: (state, action) => {
            state.query = action.payload;
        },
        setIsSearching: (state, action) => {
            state.isSearching = action.payload;
        },
        clearSearch: (state) => {
            state.query = '';
            state.isSearching = false;
        }
    }
});

export const { setSearchQuery, setIsSearching, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
