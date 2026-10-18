import { createSlice } from '@reduxjs/toolkit';
import { getUserInfo } from '../../utils/auth';

const initialState = {
    userInfo: getUserInfo(),
    loading: false,
    error: null,
    success: false
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.userInfo = action.payload;
            state.error = null;
            state.success = true;
        },
        loginFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        },
        registerRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        registerSuccess: (state, action) => {
            state.loading = false;
            state.userInfo = action.payload;
            state.error = null;
            state.success = true;
        },
        registerFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        },
        logout: (state) => {
            state.userInfo = null;
            state.error = null;
            state.success = false;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetSuccess: (state) => {
            state.success = false;
        },
        updateUserInfo: (state, action) => {
            state.userInfo = { ...state.userInfo, ...action.payload };
        }
    }
});

export const {
    loginRequest,
    loginSuccess,
    loginFail,
    registerRequest,
    registerSuccess,
    registerFail,
    logout,
    clearError,
    resetSuccess,
    updateUserInfo
} = authSlice.actions;

export default authSlice.reducer;
