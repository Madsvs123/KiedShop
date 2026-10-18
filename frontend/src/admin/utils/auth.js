import Cookies from 'js-cookie';

const COOKIE_OPTIONS = {
    expires: 30,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/'
};

export const isAdminAuthenticated = () => {
    const token = Cookies.get('adminToken');
    const info = Cookies.get('userInfo');
    if (!token || !info) return false;
    try {
        const userInfo = JSON.parse(info);
        return userInfo.isAdmin === true;
    } catch {
        return false;
    }
};

export const getAdminToken = () => Cookies.get('adminToken');

export const clearAdminToken = () => Cookies.remove('adminToken', { path: '/' });

// Also save/read admin token
export const setAdminToken = (token) => Cookies.set('adminToken', token, COOKIE_OPTIONS);
