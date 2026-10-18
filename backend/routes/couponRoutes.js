import express from 'express';
import { 
    createCoupon, 
    getCoupons, 
    getCouponById, 
    updateCoupon, 
    deleteCoupon, 
    validateCoupon 
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for coupon validation
router.post('/validate', validateCoupon);

// Admin only routes
router.route('/')
    .post(protect, admin, createCoupon)
    .get(protect, admin, getCoupons);

router.route('/:id')
    .get(protect, admin, getCouponById)
    .put(protect, admin, updateCoupon)
    .delete(protect, admin, deleteCoupon);

export default router;