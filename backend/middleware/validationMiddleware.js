import { body, validationResult } from 'express-validator';

// Validate user registration
const validateUserRegistration = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validate user login
const validateUserLogin = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validate product creation
const validateProductCreation = [
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('brand').notEmpty().withMessage('Brand is required'),
    body('countInStock').isInt({ gt: 0 }).withMessage('Count in stock must be greater than 0'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validate order placement
const validateOrderPlacement = [
    body('orderItems').isArray({ min: 1 }).withMessage('Order items are required'),
    body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    body('itemsPrice').isFloat({ gt: 0 }).withMessage('Items price must be greater than 0'),
    body('taxPrice').isFloat({ gt: 0 }).withMessage('Tax price must be greater than 0'),
    body('shippingPrice').isFloat({ gt: 0 }).withMessage('Shipping price must be greater than 0'),
    body('totalPrice').isFloat({ gt: 0 }).withMessage('Total price must be greater than 0'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export { validateUserRegistration, validateUserLogin, validateProductCreation, validateOrderPlacement };
