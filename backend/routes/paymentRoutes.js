import express from 'express';
import { createPaymentIntent, confirmPayment, handleStripeWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/create-payment-intent').post(protect, createPaymentIntent);
router.route('/confirm').post(protect, confirmPayment);
router.route('/webhook').post(express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
