import asyncHandler from 'express-async-handler';
import Coupon from '../models/Coupon.js';

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req, res) => {
    const { code, discountType, discountValue, validUntil, isActive } = req.body;

    // Validate discount type
    if (!['percentage', 'fixed'].includes(discountType)) {
        res.status(400);
        throw new Error('Discount type must be either percentage or fixed');
    }

    // Validate discount value
    if (discountValue <= 0) {
        res.status(400);
        throw new Error('Discount value must be greater than 0');
    }

    // Check if coupon code already exists
    const couponExists = await Coupon.findOne({ code });
    if (couponExists) {
        res.status(400);
        throw new Error('Coupon code already exists');
    }

    const coupon = new Coupon({
        code,
        discountType,
        discountValue,
        validUntil,
        isActive: isActive !== undefined ? isActive : true
    });

    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({});
    res.json(coupons);
});

// @desc    Get coupon by ID
// @route   GET /api/coupons/:id
// @access  Private/Admin
export const getCouponById = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        res.json(coupon);
    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = asyncHandler(async (req, res) => {
    const { code, discountType, discountValue, validUntil, isActive } = req.body;

    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        coupon.code = code || coupon.code;
        coupon.discountType = discountType || coupon.discountType;
        coupon.discountValue = discountValue || coupon.discountValue;
        coupon.validUntil = validUntil || coupon.validUntil;
        coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;

        const updatedCoupon = await coupon.save();
        res.json(updatedCoupon);
    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        await coupon.deleteOne();
        res.json({ message: 'Coupon removed' });
    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
});


// @desc    Validate and apply coupon
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = asyncHandler(async (req, res) => {
    const { code, totalAmount } = req.body;

    if (!code) {
        res.status(400);
        throw new Error('Coupon code is required');
    }

    // Find coupon by code (case insensitive)
    const coupon = await Coupon.findOne({ code: { $regex: new RegExp(`^${code}$`, 'i') } });

    if (!coupon) {
        res.status(404);
        throw new Error('Coupon not found');
    }

    // Check if coupon is active
    if (!coupon.isActive) {
        res.status(400);
        throw new Error('Coupon is not active');
    }

    // Check if coupon has expired
    const now = new Date();
    const validUntil = new Date(coupon.validUntil);
    
    if (now > validUntil) {
        res.status(400);
        throw new Error('Coupon has expired');
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
        discountAmount = (totalAmount * coupon.discountValue) / 100;
    } else {
        discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed total amount
    discountAmount = Math.min(discountAmount, totalAmount);

    res.json({
        success: true,
        couponCode: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discountAmount.toFixed(2),
        finalAmount: (totalAmount - discountAmount).toFixed(2)
    });
});
