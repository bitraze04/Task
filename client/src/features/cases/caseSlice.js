/**
 * Case Slice
 * 
 * Manages cases/tasks state with CRUD operations.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Fetch all cases
export const fetchCases = createAsyncThunk(
    'cases/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/cases', { params });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Fetch single case by ID
export const fetchCaseById = createAsyncThunk(
    'cases/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/cases/${id}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Create new case
export const createCase = createAsyncThunk(
    'cases/create',
    async (caseData, { rejectWithValue }) => {
        try {
            const response = await api.post('/cases', caseData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Update case
export const updateCase = createAsyncThunk(
    'cases/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/cases/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Update case status
export const updateCaseStatus = createAsyncThunk(
    'cases/updateStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/cases/${id}/status`, { status });
            return { id, status };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Delete case
export const deleteCase = createAsyncThunk(
    'cases/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/cases/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Fetch comments for a case
export const fetchComments = createAsyncThunk(
    'cases/fetchComments',
    async (caseId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/cases/${caseId}/comments`);
            return { caseId, comments: response.data.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Add comment to a case
export const addComment = createAsyncThunk(
    'cases/addComment',
    async ({ caseId, message }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/cases/${caseId}/comments`, { message });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    cases: [],
    selectedCase: null,
    comments: [],
    isLoading: false,
    isCommentsLoading: false,
    error: null
};

const caseSlice = createSlice({
    name: 'cases',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedCase: (state) => {
            state.selectedCase = null;
            state.comments = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all cases
            .addCase(fetchCases.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCases.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cases = action.payload;
            })
            .addCase(fetchCases.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch single case
            .addCase(fetchCaseById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCaseById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedCase = action.payload;
            })
            .addCase(fetchCaseById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create case
            .addCase(createCase.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createCase.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cases.unshift(action.payload);
            })
            .addCase(createCase.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update case
            .addCase(updateCase.fulfilled, (state, action) => {
                const index = state.cases.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.cases[index] = action.payload;
                }
                if (state.selectedCase?.id === action.payload.id) {
                    state.selectedCase = action.payload;
                }
            })
            // Update status
            .addCase(updateCaseStatus.fulfilled, (state, action) => {
                const { id, status } = action.payload;
                const caseItem = state.cases.find(c => c.id === id);
                if (caseItem) {
                    caseItem.status = status;
                }
                if (state.selectedCase?.id === id) {
                    state.selectedCase.status = status;
                }
            })
            // Delete case
            .addCase(deleteCase.fulfilled, (state, action) => {
                state.cases = state.cases.filter(c => c.id !== action.payload);
            })
            // Fetch comments
            .addCase(fetchComments.pending, (state) => {
                state.isCommentsLoading = true;
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.isCommentsLoading = false;
                state.comments = action.payload.comments;
            })
            .addCase(fetchComments.rejected, (state) => {
                state.isCommentsLoading = false;
            })
            // Add comment
            .addCase(addComment.fulfilled, (state, action) => {
                state.comments.push(action.payload);
            });
    }
});

export const { clearError, clearSelectedCase } = caseSlice.actions;
export default caseSlice.reducer;
