// admin/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import adminReducer from './store/adminSlice';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import AdminLayout from './layout/AdminLayout';
import AdminLogin from './pages/Login';
import AdminDashboard from './pages/Dashboard';
import AdminProducts from './pages/Products';
import AdminProductDetail from './pages/ProductDetail';
import AdminProductEdit from './pages/ProductEdit';
import AdminCategoryEdit from './pages/CategoryEdit';
import AdminOrders from './pages/Orders';
import AdminUsers from './pages/Users';
import AdminCategories from './pages/Categories';
import AdminCoupons from './pages/Coupons';

const store = configureStore({
    reducer: {
        admin: adminReducer
    }
});

const queryClient = new QueryClient();

const AdminApp = () => {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <Routes>
                    <Route path="login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
                    <Route path="" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="products/edit/:id" element={<AdminProductEdit />} />
                        <Route path="products/:id" element={<AdminProductDetail />} />
                        <Route path="categories/edit/:id" element={<AdminCategoryEdit />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="coupons" element={<AdminCoupons />} />
                    </Route>
                </Routes>
            </QueryClientProvider>
        </Provider>
    );
};

export default AdminApp;
