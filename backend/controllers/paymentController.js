import asyncHandler from 'express-async-handler';
import stripe from 'stripe';
import Order from '../models/Order.js';

// Initialize Stripe with secret key from environment variables
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create Stripe payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
export const createPaymentIntent = asyncHandler(async (req, res) => {
    const { amount, currency = 'usd', orderId } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
        res.status(400);
        throw new Error('Amount must be greater than 0');
    }

    // Create payment intent
    const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses cents
        currency: currency.toLowerCase(),
        metadata: { orderId }
    });

    res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
    });
});

// @desc    Confirm payment and update order
// @route   POST /api/payments/confirm
// @access  Private
export const confirmPayment = asyncHandler(async (req, res) => {
    const { paymentIntentId, orderId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
        res.status(400);
        throw new Error('Payment not successful');
    }

    // Update order status
    const order = await Order.findById(orderId);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        update_time: new Date(paymentIntent.created * 1000).toISOString(),
        email_address: paymentIntent.receipt_email || ''
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
});

// @desc    Handle Stripe webhook events
// @route   POST /api/payments/webhook
// @access  Public
export const handleStripeWebhook = asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            
            // Update order status
            const orderId = paymentIntent.metadata.orderId;
            const order = await Order.findById(orderId);
            
            if (order) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                    update_time: new Date(paymentIntent.created * 1000).toISOString(),
                    email_address: paymentIntent.receipt_email || ''
                };
                
                await order.save();
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
});
