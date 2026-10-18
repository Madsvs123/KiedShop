import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            if (!token) {
                res.status(401);
                throw new Error('Not authorized, no token provided');
            }

            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET is not set in environment variables');
                res.status(500);
                throw new Error('Server configuration error');
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!decoded || !decoded.id) {
                res.status(401);
                throw new Error('Not authorized, invalid token payload');
            }

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next();
        } catch (error) {
            console.error('Authentication error:', error);
            res.status(401);
            throw new Error('Not authorized, token failed: ' + error.message);
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no authorization header');
    }
});

// Admin access only
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

export { protect, admin };
