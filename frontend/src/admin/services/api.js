import axios from 'axios';
import Cookies from 'js-cookie';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
});

// Request interceptor to add auth token
API.interceptors.request.use((req) => {
    const token = Cookies.get('adminToken') || Cookies.get('userToken');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Admin authentication
export const adminLogin = (formData) => API.post('/api/users/login', formData);

// User management
export const getAllUsers = () => API.get('/api/users');
export const getUserById = (id) => API.get(`/api/users/${id}`);
export const updateUser = (id, userData) => API.put(`/api/users/${id}`, userData);
export const deleteUser = (id) => API.delete(`/api/users/${id}`);

// Product management with file upload support
export const getProducts = () => API.get('/api/products');
export const getProductById = (id) => API.get(`/api/products/${id}`);
export const createProduct = (productData) => {
    // Check if FormData is being used (for file uploads)
    if (productData instanceof FormData) {
        return API.post('/api/products', productData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
    return API.post('/api/products', productData);
};
export const updateProduct = (id, productData) => {
    // Check if FormData is being used (for file uploads)
    if (productData instanceof FormData) {
        return API.put(`/api/products/${id}`, productData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
    return API.put(`/api/products/${id}`, productData);
};
export const deleteProduct = (id) => API.delete(`/api/products/${id}`);

// Order management
export const getOrders = () => API.get('/api/orders');
export const updateOrderToDelivered = (id) => API.put(`/api/orders/${id}/deliver`);

// Category management
export const getCategories = () => API.get('/api/categories');
export const getCategoryTree = () => API.get('/api/categories/tree');
export const getCategoryById = (id) => API.get(`/api/categories/${id}`);
export const getCategoryBySlug = (slug) => API.get(`/api/categories/slug/${slug}`);
export const createCategory = (categoryData) => API.post('/api/categories', categoryData);
export const updateCategory = (id, categoryData) => API.put(`/api/categories/${id}`, categoryData);
export const deleteCategory = (id) => API.delete(`/api/categories/${id}`);

// Coupon management
export const getCoupons = () => API.get('/api/coupons');
export const getCouponById = (id) => API.get(`/api/coupons/${id}`);
export const createCoupon = (couponData) => API.post('/api/coupons', couponData);
export const updateCoupon = (id, couponData) => API.put(`/api/coupons/${id}`, couponData);
export const deleteCoupon = (id) => API.delete(`/api/coupons/${id}`);

// Notification management
export const getNotifications = () => API.get('/api/notifications');
export const getUnreadNotifications = () => API.get('/api/notifications/unread');
export const getNotificationStats = () => API.get('/api/notifications/stats');
export const markNotificationAsRead = (id) => API.put(`/api/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => API.put('/api/notifications/mark-all-read');

export default API;