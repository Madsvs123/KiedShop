import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getBrands } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateProductCreation } from '../middleware/validationMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

router.route('/brands').get(getBrands);
router.route('/').get(getProducts).post(protect, admin, validateProductCreation, upload.array('images', 6), createProduct);
router.route('/:id').get(getProductById).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);

export default router;
