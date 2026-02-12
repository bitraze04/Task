/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import caseReducer from '../features/cases/caseSlice';
import filterReducer from '../features/filter/filterSlice';
import uiReducer from '../features/ui/uiSlice';
import activityReducer from '../features/activities/activitySlice';
import searchReducer from '../features/search/searchSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cases: caseReducer,
        filter: filterReducer,
        ui: uiReducer,
        activities: activityReducer,
        search: searchReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types (Firebase user object is not serializable)
                ignoredActions: ['auth/setUser'],
                ignoredPaths: ['auth.user']
            }
        })
});

export default store;
