import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product');

    if (cart) {
        res.json(cart);
    } else {
        // Create a new cart if none exists
        const newCart = new Cart({
            user: req.user._id,
            cartItems: [],
            totalPrice: 0
        });
        await newCart.save();
        res.json(newCart);
    }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    // Validate quantity
    if (!quantity || quantity < 1) {
        res.status(400);
        throw new Error('Quantity must be at least 1');
    }

    // Check if product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.countInStock < quantity) {
        res.status(400);
        throw new Error('Not enough product in stock');
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = new Cart({
            user: req.user._id,
            cartItems: [],
            totalPrice: 0
        });
    }

    // Check if product already in cart
    const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
        // Update quantity if product exists
        cart.cartItems[itemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        cart.cartItems.push({ product: productId, quantity });
    }

    // Calculate total price
    cart.totalPrice = cart.cartItems.reduce((total, item) => {
        const itemPrice = product.price * item.quantity;
        return total + itemPrice;
    }, 0);

    const updatedCart = await cart.save();
    res.json(updatedCart);
});

// @desc    Update item quantity in cart
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const { itemId } = req.params;

    // Validate quantity
    if (!quantity || quantity < 1) {
        res.status(400);
        throw new Error('Quantity must be at least 1');
    }

    // Find cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    // Find item in cart
    const itemIndex = cart.cartItems.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
        res.status(404);
        throw new Error('Item not found in cart');
    }

    // Check product stock
    const product = await Product.findById(cart.cartItems[itemIndex].product);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.countInStock < quantity) {
        res.status(400);
        throw new Error('Not enough product in stock');
    }

    // Update quantity
    cart.cartItems[itemIndex].quantity = quantity;

    // Calculate total price
    cart.totalPrice = cart.cartItems.reduce((total, item) => {
        const itemPrice = product.price * item.quantity;
        return total + itemPrice;
    }, 0);

    const updatedCart = await cart.save();
    res.json(updatedCart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    // Find cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    // Remove item from cart
    cart.cartItems = cart.cartItems.filter(item => item._id.toString() !== itemId);

    // Calculate total price
    cart.totalPrice = cart.cartItems.reduce((total, item) => {
        const itemPrice = item.product.price * item.quantity;
        return total + itemPrice;
    }, 0);

    const updatedCart = await cart.save();
    res.json(updatedCart);
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
    // Find cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    // Clear cart
    cart.cartItems = [];
    cart.totalPrice = 0;

    const updatedCart = await cart.save();
    res.json(updatedCart);
});
