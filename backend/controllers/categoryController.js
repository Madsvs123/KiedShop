import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isSubcategory: false }).populate('parentCategory');
    res.json(categories);
});

// @desc    Get category tree (with subcategories)
// @route   GET /api/categories/tree
// @access  Public
export const getCategoryTree = asyncHandler(async (req, res) => {
    try {
        // Get all categories that are not subcategories
        const mainCategories = await Category.find({ isSubcategory: false });
        
        // For each main category, get its subcategories
        const categoriesWithSubcategories = await Promise.all(
            mainCategories.map(async (category) => {
                // Find subcategories that have this category as parent
                const subcategories = await Category.find({
                    parentCategory: category._id,
                    isSubcategory: true
                });
                
                return {
                    ...category.toObject(),
                    subcategories
                };
            })
        );
        
        res.json(categoriesWithSubcategories);
    } catch (error) {
        res.status(500);
        throw new Error('Failed to fetch category tree');
    }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        res.json(category);
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
    const { name, slug, description, image, subcategories = [], parentCategory, isSubcategory = false } = req.body;

    const categoryExists = await Category.findOne({ slug });

    if (categoryExists) {
        res.status(400);
        throw new Error('Category slug already exists');
    }

    // Validate parent category if this is a subcategory
    if (isSubcategory && parentCategory) {
        const parentCat = await Category.findById(parentCategory);
        if (!parentCat) {
            res.status(404);
            throw new Error('Parent category not found');
        }
    }

    const category = new Category({
        name,
        slug,
        description: description || '',
        image: image || '',
        subcategories,
        parentCategory: parentCategory || null,
        isSubcategory
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
    const { name, slug, description, image } = req.body;

    const category = await Category.findById(req.params.id);

    if (category) {
        category.name = name || category.name;
        category.slug = slug || category.slug;
        category.description = description || category.description;
        category.image = image || category.image;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        await category.deleteOne();
        res.json({ message: 'Category removed' });
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});
