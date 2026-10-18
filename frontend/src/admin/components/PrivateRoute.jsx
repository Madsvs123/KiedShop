import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated } from '../utils/auth';

const PrivateRoute = ({ children }) => {
    const location = useLocation();
    const isAuthenticated = isAdminAuthenticated();
    
    if (!isAuthenticated) {
        // Redirect to admin login, preserving the attempted URL
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    
    return children;
};

export default PrivateRoute;
