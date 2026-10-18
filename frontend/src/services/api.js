import axios from 'axios';
import Cookies from 'js-cookie';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
});

// Request interceptor to add auth token
API.interceptors.request.use((req) => {
    const token = Cookies.get('userToken');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// ==================== AUTH ENDPOINTS ====================
export const register = (userData) => API.post('/api/users', userData);
export const login = (userData) => API.post('/api/users/login', userData);
export const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    return Promise.resolve();
};
export const getUserProfile = () => API.get('/api/users/profile');
export const updateUserProfile = (userData) => API.put('/api/users/profile', userData);
export const forgotPassword = (data) => API.post('/api/users/forgot-password', data);
export const resetPassword = (token, data) => API.post(`/api/users/reset-password/${token}`, data);

// ==================== PRODUCT ENDPOINTS ====================
export const getProducts = (params = {}) => API.get('/api/products', { params });
export const getBrands = () => API.get('/api/products/brands');
export const getProductById = (id) => API.get(`/api/products/${id}`);
export const getProductsByCategory = (categorySlug, params = {}) => {
    let url = `/api/products?category=${categorySlug}`;
    if (params.subcategory) url += `&subcategory=${params.subcategory}`;
    if (params.sort) url += `&sort=${params.sort}`;
    return API.get(url);
};
export const getRelatedProducts = (productId) => API.get(`/api/products/${productId}/related`);

// ==================== CATEGORY ENDPOINTS ====================
export const getCategories = () => API.get('/api/categories');
export const getCategoryById = (id) => API.get(`/api/categories/${id}`);
export const getCategoryBySlug = (slug) => API.get(`/api/categories/slug/${slug}`);
export const getCategoryTree = () => API.get('/api/categories/tree');
export const getFeaturedCategories = () => API.get('/api/categories/featured');

// ==================== CART ENDPOINTS ====================
export const getCart = () => API.get('/api/cart');
export const addToCart = (data) => API.post('/api/cart', data);
export const updateCartItem = (itemId, quantity) => API.put(`/api/cart/${itemId}`, { quantity });
export const removeFromCart = (itemId) => API.delete(`/api/cart/${itemId}`);
export const clearCart = () => API.delete('/api/cart');

// ==================== ORDER ENDPOINTS ====================
export const getOrders = () => API.get('/api/orders/myorders');
export const getOrderById = (id) => API.get(`/api/orders/${id}`);
export const createOrder = (orderData) => API.post('/api/orders', orderData);
export const updateOrderToPaid = (id, paymentResult) => API.put(`/api/orders/${id}/pay`, paymentResult);

// ==================== COUPON ENDPOINTS ====================
export const validateCoupon = (data) => API.post('/api/coupons/validate', data);

// ==================== NOTIFICATION ENDPOINTS ====================
export const getNotifications = () => API.get('/api/notifications');
export const getUnreadNotifications = () => API.get('/api/notifications/unread');
export const markNotificationAsRead = (id) => API.put(`/api/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => API.put('/api/notifications/mark-all-read');

export default API;