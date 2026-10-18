import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { sendOrderConfirmationEmail, sendOrderShippedEmail, sendOrderDeliveredEmail } from '../config/nodemailer.js';
import { createEcommerceNotification } from './notificationController.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        couponCode,
        discountAmount
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        // Ensure each item has required fields with fallbacks
        const safeItems = (orderItems || []).map(item => ({
            name: item.name || 'Product',
            qty: Number(item.qty) || 1,
            image: item.image || '/images/placeholder.png',
            price: Number(item.price) || 0,
            product: item.product
        }));

        const order = new Order({
            user: req.user._id,
            orderItems: safeItems,
            shippingAddress,
            paymentMethod,
            itemsPrice: Number(itemsPrice) || 0,
            taxPrice: Number(taxPrice) || 0,
            shippingPrice: Number(shippingPrice) || 0,
            totalPrice: Number(totalPrice) || 0,
            couponCode: couponCode || null,
            discountAmount: Number(discountAmount) || 0
        });

        const createdOrder = await order.save();

        // Send order confirmation email
        try {
            await sendOrderConfirmationEmail(
                req.user.email,
                createdOrder._id,
                createdOrder.orderItems,
                createdOrder.totalPrice
            );
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
            // Don't fail the order creation if email fails
        }

        // Notify admins of new order
        try {
            await createEcommerceNotification({
                type: 'new-order',
                title: 'New Order Received',
                message: `Order #${createdOrder._id} — ${req.user.name || 'A customer'} placed an order for $${totalPrice.toFixed(2)}`,
                recipientType: 'admin',
                data: {
                    orderId: createdOrder._id,
                    userId: req.user._id,
                    totalPrice
                }
            });
        } catch (notifError) {
            console.error('Failed to create new order notification:', notifError);
        }

        res.status(201).json(createdOrder);
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        const updatedOrder = await order.save();

        // Notify admins of payment
        try {
            await createEcommerceNotification({
                type: 'order-update',
                title: 'Order Payment Received',
                message: `Order #${updatedOrder._id} has been paid`,
                recipientType: 'admin',
                data: { orderId: updatedOrder._id }
            });
        } catch (notifError) {
            console.error('Failed to create payment notification:', notifError);
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save();

        // Send shipped email + notification
        const shippedUser = await User.findById(order.user).select('email name');
        
        try {
            await sendOrderShippedEmail(shippedUser.email, updatedOrder._id);
        } catch (e) {
            console.error('Failed to send shipped email:', e);
        }

        const delUser = await User.findById(order.user).select('email name');

        // Send delivered email
        try {
            await sendOrderDeliveredEmail(delUser.email, updatedOrder._id);
        } catch (e) {
            console.error('Failed to send delivered email:', e);
        }

        // Notify user their order is delivered
        try {
            await createEcommerceNotification({
                type: 'order-update',
                title: 'Order Delivered',
                message: `Your order #${updatedOrder._id} has been delivered!`,
                recipientType: 'user',
                data: {
                    orderId: updatedOrder._id,
                    userId: order.user
                }
            });
        } catch (notifError) {
            console.error('Failed to create delivery notification:', notifError);
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
});
