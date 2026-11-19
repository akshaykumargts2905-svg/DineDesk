import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All category routes require authentication
router.use(authenticate);

// Read is accessible to all authenticated staff
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Write is restricted to RESTAURANT_ADMIN and MANAGER
router.post('/', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER'), createCategory);
router.put('/:id', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER'), updateCategory);
router.delete('/:id', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER'), deleteCategory);

export default router;
