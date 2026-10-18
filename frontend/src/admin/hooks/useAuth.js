import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';
import { adminLoginRequest, adminLoginSuccess, adminLoginFail, adminLogout } from '../store/adminSlice';
import { getAdminToken, setAdminToken, clearAdminToken } from '../utils/auth';
import { setUserInfo, removeUserInfo, removeUserToken } from '../../utils/auth';

export const useAuth = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const adminInfo = useSelector((state) => state.admin.adminInfo);
    const isAuthenticatedFromStore = useSelector((state) => state.admin.isAuthenticated);

    const checkAuth = () => {
        const token = getAdminToken();
        return !!(token && adminInfo?.isAdmin);
    };

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        
        try {
            dispatch(adminLoginRequest());
            const { data } = await adminLogin({ email, password });
            
            if (!data.isAdmin) {
                const errorMsg = 'Access denied. Admin privileges required.';
                setError(errorMsg);
                dispatch(adminLoginFail(errorMsg));
                return false;
            }
            
            setAdminToken(data.token);
            setUserInfo(data);
            
            dispatch(adminLoginSuccess(data));
            navigate('/admin/dashboard', { replace: true });
            return true;
            
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            dispatch(adminLoginFail(errorMessage));
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        clearAdminToken();
        removeUserToken();
        dispatch(adminLogout());
        navigate('/admin/login', { replace: true });
    };

    const getAuthHeader = () => {
        const token = getAdminToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    return { 
        login, logout, error, loading,
        user: adminInfo,
        isAuthenticated: checkAuth(),
        getAuthHeader
    };
};
