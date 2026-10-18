import express from 'express';
import { registerUser, authUser, getUsers, getUserById, updateUser, deleteUser, getUserProfile, updateUserProfile, forgotPassword, resetPassword } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateUserRegistration, validateUserLogin } from '../middleware/validationMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

router.route('/').post(authLimiter, upload.single('avatar'), validateUserRegistration, registerUser).get(protect, admin, getUsers);
router.post('/login', authLimiter, validateUserLogin, authUser);

// Admin routes
router.route('/:id').get(protect, admin, getUserById).put(protect, admin, updateUser).delete(protect, admin, deleteUser);

// User profile routes
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

// Password reset routes (public)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
