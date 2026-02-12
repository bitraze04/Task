/**
 * Activity Slice
 * 
 * Redux slice for managing case activity timeline.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/apiClient';

// Fetch activities for a case
export const fetchActivities = createAsyncThunk(
    'activities/fetchActivities',
    async (caseId, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/cases/${caseId}/activities`);
            return { caseId, activities: response.data.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
        }
    }
);

const activitySlice = createSlice({
    name: 'activities',
    initialState: {
        activitiesByCaseId: {}, // { caseId: [activities] }
        isLoading: false,
        error: null
    },
    reducers: {
        clearActivities: (state, action) => {
            if (action.payload) {
                delete state.activitiesByCaseId[action.payload];
            } else {
                state.activitiesByCaseId = {};
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchActivities.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchActivities.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activitiesByCaseId[action.payload.caseId] = action.payload.activities;
            })
            .addCase(fetchActivities.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearActivities } = activitySlice.actions;
export default activitySlice.reducer;
