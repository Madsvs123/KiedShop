import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getNotifications,
    getUnreadNotifications,
    getNotificationStats,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '../controllers/notificationController.js';

const router = express.Router();

// Notification routes
router.route('/')
    .get(protect, getNotifications);

router.route('/unread')
    .get(protect, getUnreadNotifications);

router.route('/stats')
    .get(protect, admin, getNotificationStats);

router.route('/:id/read')
    .put(protect, markNotificationAsRead);

router.route('/mark-all-read')
    .put(protect, markAllNotificationsAsRead);

export default router;