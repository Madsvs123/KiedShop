import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
// io is set by the server during setup; we import it lazily
let ioServerInstance = null;
export const setIO = (io) => { ioServerInstance = io; };
const getIO = () => ioServerInstance;

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ 
        recipientId: req.user._id,
        recipientType: req.user.isAdmin ? 'admin' : 'user'
    })
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json(notifications);
});

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread
// @access  Private
export const getUnreadNotifications = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({
        recipientId: req.user._id,
        recipientType: req.user.isAdmin ? 'admin' : 'user',
        isRead: false
    });
    
    res.json({ count });
});

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private/Admin
export const getNotificationStats = asyncHandler(async (req, res) => {
    const total = await Notification.countDocuments();
    const unread = await Notification.countDocuments({ isRead: false });
    const lastWeek = await Notification.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    res.json({ total, unread, lastWeek });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }
    
    // Check if user is the recipient
    if (notification.recipientId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to mark this notification as read');
    }
    
    notification.isRead = true;
    const updatedNotification = await notification.save();
    
    res.json(updatedNotification);
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        {
            recipientId: req.user._id,
            recipientType: req.user.isAdmin ? 'admin' : 'user',
            isRead: false
        },
        { $set: { isRead: true } }
    );
    
    // Socket: notify the user that notifications were cleared
    const io = getIO();
    if (io) {
        io.to(req.user._id.toString()).emit('notification', {});
    }
    
    res.json({ message: 'All notifications marked as read' });
});

// @desc    Create notification (internal use)
export const createNotification = async (recipientId, recipientType, type, title, message, data = {}) => {
    try {
        const notification = new Notification({
            recipientId,
            recipientType,
            type,
            title,
            message,
            data
        });
        
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
        return null;
    }
};

// @desc    Create notification for e-commerce events (orders, users, etc.)
export const createEcommerceNotification = async ({
    type,
    title,
    message,
    recipientType = 'admin',
    data = {}
}) => {
    try {
        const validTypes = ['new-order', 'order-update', 'order-cancelled', 'new-user', 'system-announcement'];
        if (!validTypes.includes(type)) {
            console.error('Invalid e-commerce notification type:', type);
            return null;
        }

        let recipients = [];

        if (recipientType === 'admin') {
            // Notify all admins
            const admins = await User.find({ isAdmin: true }).select('_id name email');
            recipients = admins.map(a => ({
                id: a._id,
                type: 'admin'
            }));
        } else if (recipientType === 'user' && data.userId) {
            // Notify a specific user (e.g. order status update for the customer)
            recipients.push({ id: data.userId, type: 'user' });
        }

        if (recipients.length === 0) {
            console.warn('No recipients for e-commerce notification');
            return null;
        }

        const results = await Promise.all(recipients.map(r =>
            createNotification(r.id, r.type, type, title, message, data)
        ));

        return results.filter(Boolean);
    } catch (error) {
        console.error('Failed to create e-commerce notification:', error);
        return null;
    }
};