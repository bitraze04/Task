/**
 * Auth Slice
 * 
 * Manages authentication state and user data.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../../firebase/config';
import api from '../../api/axios';

// Async thunk for login
export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Fetch user profile from backend
            const response = await api.get('/auth/me');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for signup
export const signupUser = createAsyncThunk(
    'auth/signup',
    async ({ email, password, name }, { rejectWithValue }) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Register user in Firestore via backend
            const response = await api.post('/auth/register', {
                uid: userCredential.user.uid,
                email,
                name
            });

            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await signOut(auth);
            return null;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk to initialize auth state
export const initializeAuth = createAsyncThunk(
    'auth/initialize',
    async (_, { rejectWithValue }) => {
        try {
            return new Promise((resolve, reject) => {
                const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                    unsubscribe();
                    if (firebaseUser) {
                        try {
                            const response = await api.get('/auth/me');
                            resolve(response.data.data);
                        } catch (error) {
                            resolve(null);
                        }
                    } else {
                        resolve(null);
                    }
                }, reject);
            });
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk to fetch all users (for assignment dropdown)
export const fetchUsers = createAsyncThunk(
    'auth/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/users');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk to update user role (admin only)
export const updateUserRole = createAsyncThunk(
    'auth/updateUserRole',
    async ({ uid, role }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/auth/users/${uid}/role`, { role });
            return { uid, role };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Async thunk to fetch user permissions (admin only)
export const fetchUserPermissions = createAsyncThunk(
    'auth/fetchUserPermissions',
    async (uid, { rejectWithValue }) => {
        try {
            const response = await api.get(`/auth/users/${uid}/permissions`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Async thunk to update user permissions (admin only)
export const updateUserPermissions = createAsyncThunk(
    'auth/updateUserPermissions',
    async ({ uid, permissions }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/auth/users/${uid}/permissions`, { permissions });
            return { uid, permissions: response.data.data.permissions };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);


const initialState = {
    user: null,
    users: [],
    targetUserPermissions: null,
    isLoading: false,
    isInitialized: false,
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Initialize auth
            .addCase(initializeAuth.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(initializeAuth.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isInitialized = true;
                state.user = action.payload;
            })
            .addCase(initializeAuth.rejected, (state, action) => {
                state.isLoading = false;
                state.isInitialized = true;
                state.error = action.payload;
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Signup
            .addCase(signupUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
            })
            // Fetch users
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.users = action.payload;
            })
            // Update user role
            .addCase(updateUserRole.fulfilled, (state, action) => {
                const { uid, role } = action.payload;
                const userIndex = state.users.findIndex(u => u.uid === uid);
                if (userIndex !== -1) {
                    state.users[userIndex].role = role;
                }
            })
            // Fetch user permissions
            .addCase(fetchUserPermissions.fulfilled, (state, action) => {
                state.targetUserPermissions = action.payload;
            })
            // Update user permissions
            .addCase(updateUserPermissions.fulfilled, (state, action) => {
                const { uid, permissions } = action.payload;
                state.targetUserPermissions = {
                    ...state.targetUserPermissions,
                    permissions
                };
                // Also update in users array
                const userIndex = state.users.findIndex(u => u.uid === uid);
                if (userIndex !== -1) {
                    state.users[userIndex].permissions = permissions;
                }
                // If editing own permissions (edge case), update current user
                if (state.user && state.user.uid === uid) {
                    state.user.permissions = permissions;
                }
            });
    }
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
