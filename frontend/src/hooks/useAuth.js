import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register, logoutUser } from '../store/slices/authActions';
import { clearError, resetSuccess } from '../store/slices/authSlice';
import { getUserToken, getUserInfo, isAuthenticated as checkAuth } from '../utils/auth';

export const useAuth = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Get auth state from Redux
    const { userInfo, loading: reduxLoading, error: reduxError, success } = useSelector((state) => state.auth);
    
    // Check authentication status
    const isAuthenticated = checkAuth();
    
    // Clear errors
    const clearAuthError = () => {
        dispatch(clearError());
        setError(null);
    };
    
    // Login user
    const loginUser = async (email, password) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await dispatch(login({ email, password })).unwrap();
            return { success: true, user: result };
        } catch (err) {
            const errorMessage = err.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };
    
    // Register user
    const registerUser = async (userData) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await dispatch(register(userData)).unwrap();
            return { success: true, user: result };
        } catch (err) {
            const errorMessage = err.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };
    
    // Logout user
    const logoutUserFn = () => {
        dispatch(logoutUser());
        navigate('/login');
    };
    
    // Update user info locally
    const updateLocalUserInfo = (updatedInfo) => {
        const currentInfo = getUserInfo();
        if (currentInfo) {
            const newInfo = { ...currentInfo, ...updatedInfo };
            localStorage.setItem('userInfo', JSON.stringify(newInfo));
        }
    };
    
    // Get auth header
    const getAuthHeader = () => {
        const token = getUserToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    };
    
    return {
        user: userInfo,
        isAuthenticated,
        loading: loading || reduxLoading,
        error: error || reduxError,
        success,
        login: loginUser,
        register: registerUser,
        logout: logoutUserFn,
        clearError: clearAuthError,
        getAuthHeader,
        updateLocalUserInfo
    };
};