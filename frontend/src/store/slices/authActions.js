import { createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, register as registerApi } from '../../services/api';
import { 
    loginRequest, loginSuccess, loginFail, 
    registerRequest, registerSuccess, registerFail,
    logout 
} from './authSlice';
import { setUserToken, setAdminToken, setUserInfo, removeUserToken, removeAdminToken } from '../../utils/auth';

// Login action
export const login = createAsyncThunk(
    'auth/login',
    async (userData, { dispatch }) => {
        try {
            dispatch(loginRequest());
            const { data } = await loginApi(userData);
            
            if (data.token) {
                setUserToken(data.token);
                // Store in both user cookie and admin cookie if admin
                if (data.isAdmin) {
                    setAdminToken(data.token);
                }
                setUserInfo(data);
            }
            
            dispatch(loginSuccess(data));
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            dispatch(loginFail(message));
            throw new Error(message);
        }
    }
);

// Register action
export const register = createAsyncThunk(
    'auth/register',
    async (userData, { dispatch }) => {
        try {
            dispatch(registerRequest());
            const { data } = await registerApi(userData);
            
            if (data.token) {
                setUserToken(data.token);
                setUserInfo(data);
            }
            
            dispatch(registerSuccess(data));
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Registration failed';
            dispatch(registerFail(message));
            throw new Error(message);
        }
    }
);

// Logout action
export const logoutUser = () => (dispatch) => {
    removeUserToken();
    removeAdminToken();
    dispatch(logout());
};
