import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import fs from 'fs';
import path from 'path';

// @desc    Get all products (with search, filters, sort)
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
    const { category, subcategory, sort, q, minPrice, maxPrice, brand: brandFilter, inStock } = req.query;

    // Text search
    if (q) {
        const products = await Product.find(
            { $text: { $search: q } },
            { score: { $meta: 'textScore' } }
        )
            .populate('category', 'name slug')
            .sort({ score: { $meta: 'textScore' } });
        res.json(products);
        return;
    }
    let query = {};
    
    // Filter by category
    if (category) {
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
            query.category = categoryDoc._id;
        }
    }
    
    // Filter by subcategory
    if (subcategory) {
        query.subcategory = subcategory;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Filter by brand
    if (brandFilter) {
        query.brand = { $regex: brandFilter, $options: 'i' };
    }

    if (inStock === 'true' || inStock === '1') {
        query.countInStock = { $gt: 0 };
    }
    
    let productsQuery = Product.find(query).populate('category', 'name slug');
    
    // Apply sorting
    if (sort === 'price_asc') {
        productsQuery = productsQuery.sort('price');
    } else if (sort === 'price_desc') {
        productsQuery = productsQuery.sort('-price');
    } else if (sort === 'rating') {
        productsQuery = productsQuery.sort('-rating');
    } else if (sort === 'newest') {
        productsQuery = productsQuery.sort('-createdAt');
    }
    
    const products = await productsQuery;
    res.json(products);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category', 'name slug subcategories');
    
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
    const { name, price, description, brand, category, subcategory, countInStock } = req.body;
    
    let primaryImage = '/images/sample.jpg';
    let secondaryImages = [];
    
    // Handle file uploads
    if (req.files && req.files.length > 0) {
        // First file is primary image
        primaryImage = `/uploads/${req.files[0].filename}`;
        
        // Remaining files are secondary images (max 5)
        secondaryImages = req.files.slice(1, 6).map(file => `/uploads/${file.filename}`);
    }
    
    // Handle URL-based images (from form input)
    if (req.body.primaryImageUrl && !primaryImage.startsWith('/uploads')) {
        primaryImage = req.body.primaryImageUrl;
    }
    
    if (req.body.secondaryImageUrls) {
        const urls = Array.isArray(req.body.secondaryImageUrls) 
            ? req.body.secondaryImageUrls 
            : req.body.secondaryImageUrls.split(',').map(url => url.trim());
        secondaryImages = [...secondaryImages, ...urls].slice(0, 5);
    }
    
    const product = new Product({
        name,
        price: Number(price),
        user: req.user._id,
        primaryImage,
        secondaryImages,
        brand,
        category,
        subcategory: subcategory || '',
        countInStock: Number(countInStock),
        numReviews: 0,
        description
    });
    
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
    const { name, price, description, primaryImageUrl, secondaryImageUrls, brand, category, subcategory, countInStock } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    
    // Update basic info
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.subcategory = subcategory || product.subcategory;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    
    // Handle file uploads for update
    if (req.files && req.files.length > 0) {
        // Delete old images if they were uploaded files
        if (product.primaryImage && product.primaryImage.startsWith('/uploads/')) {
            const oldPath = path.join('.', product.primaryImage);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
        
        // Set new primary image
        product.primaryImage = `/uploads/${req.files[0].filename}`;
        
        // Clear old secondary images that were uploaded files
        product.secondaryImages = product.secondaryImages.filter(img => !img.startsWith('/uploads/'));
        
        // Add new secondary images
        const newSecondaryImages = req.files.slice(1, 6).map(file => `/uploads/${file.filename}`);
        product.secondaryImages = [...product.secondaryImages, ...newSecondaryImages].slice(0, 5);
    }
    
    // Handle URL-based image updates
    if (primaryImageUrl !== undefined) {
        product.primaryImage = primaryImageUrl || product.primaryImage;
    }
    
    if (secondaryImageUrls !== undefined) {
        const urls = Array.isArray(secondaryImageUrls) 
            ? secondaryImageUrls 
            : secondaryImageUrls.split(',').map(url => url.trim()).filter(url => url);
        const existingFileImages = product.secondaryImages.filter(img => img.startsWith('/uploads/'));
        product.secondaryImages = [...existingFileImages, ...urls].slice(0, 5);
    }
    
    const updatedProduct = await product.save();
    res.json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    
    // Delete uploaded image files
    if (product.primaryImage && product.primaryImage.startsWith('/uploads/')) {
        const primaryPath = path.join('.', product.primaryImage);
        if (fs.existsSync(primaryPath)) {
            fs.unlinkSync(primaryPath);
        }
    }
    
    product.secondaryImages.forEach(image => {
        if (image.startsWith('/uploads/')) {
            const imagePath = path.join('.', image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
    });
    
    await product.deleteOne();
    res.json({ message: 'Product removed' });
});

// @desc    Get distinct brands for filter
// @route   GET /api/products/brands
// @access  Public
export const getBrands = asyncHandler(async (req, res) => {
    const brands = await Product.distinct('brand', { brand: { $ne: '', $exists: true } });
    res.json(brands.sort());
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }
    
    const relatedProducts = await Product.find({
        _id: { $ne: product._id },
        category: product.category
    }).limit(4);
    
    res.json(relatedProducts);
});