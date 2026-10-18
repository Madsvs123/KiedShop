import express from 'express';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory, getCategoryTree } from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getCategories).post(protect, admin, createCategory);
router.route('/tree').get(getCategoryTree);
router.route('/:id').get(getCategoryById).put(protect, admin, updateCategory).delete(protect, admin, deleteCategory);

export default router;
