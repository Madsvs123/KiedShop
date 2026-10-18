import { io } from 'socket.io-client';

let socket = null;
let connectionPromise = null;

/**
 * Initialize Socket.IO connection
 * @param {string} token - Auth token
 * @returns {Socket} Socket.IO instance
 */
export const initSocket = (token) => {
    if (socket && socket.connected) return socket;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

    socket = io(baseUrl, {
        auth: { token: `Bearer ${token}` },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: false,
        withCredentials: true
    });

    return socket;
};

export const connectSocket = () => {
    if (!socket) throw new Error('Socket not initialized. Call initSocket() first.');
    if (socket.connected) return Promise.resolve(socket);
    if (!connectionPromise) {
        connectionPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Socket connection timeout')), 5000);
            socket.on('connect', () => { clearTimeout(timeout); connectionPromise = null; resolve(socket); });
            socket.on('connect_error', (err) => { clearTimeout(timeout); connectionPromise = null; reject(err); });
            socket.connect();
        });
    }
    return connectionPromise;
};

export const disconnectSocket = () => {
    if (socket && socket.connected) socket.disconnect();
    connectionPromise = null;
};

export const getSocket = () => {
    if (!socket) throw new Error('Socket not initialized');
    return socket;
};

export const isConnected = () => socket ? socket.connected : false;

export const reconnectSocket = async (token) => {
    if (socket) disconnectSocket();
    const newSocket = initSocket(token);
    return await connectSocket();
};
