import Cookies from 'js-cookie';

const COOKIE_OPTIONS = {
    expires: 30,           // 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/'
};

// ── User Token ──
export const getUserToken = () => Cookies.get('userToken');
export const setUserToken = (token) => Cookies.set('userToken', token, COOKIE_OPTIONS);
export const removeUserToken = () => Cookies.remove('userToken', { path: '/' });

// ── User Info ──
export const getUserInfo = () => {
    const raw = Cookies.get('userInfo');
    return raw ? JSON.parse(raw) : null;
};
export const setUserInfo = (info) => Cookies.set('userInfo', JSON.stringify(info), COOKIE_OPTIONS);
export const removeUserInfo = () => Cookies.remove('userInfo', { path: '/' });

// ── Admin Token ──
export const getAdminToken = () => Cookies.get('adminToken');
export const setAdminToken = (token) => Cookies.set('adminToken', token, COOKIE_OPTIONS);
export const removeAdminToken = () => Cookies.remove('adminToken', { path: '/' });

// ── Auth Checks ──
export const isAuthenticated = () => !!getUserToken() && !!getUserInfo();
export const isAdminAuthenticated = () => {
    const token = getAdminToken();
    const info = getUserInfo();
    return !!token && !!info && info.isAdmin === true;
};

// ── Clear All ──
export const clearAuthData = () => {
    removeUserToken();
    removeUserInfo();
    removeAdminToken();
};

// ── Auth Header ──
export const getAuthHeader = () => {
    const token = getUserToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};
