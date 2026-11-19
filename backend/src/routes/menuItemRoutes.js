import express from 'express';
import {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  updateMenuItemAvailability,
  deleteMenuItem,
} from '../controllers/menuItemController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Read is accessible to all authenticated staff
router.get('/', getAllMenuItems);
router.get('/:id', getMenuItemById);

// Availability toggle accessible to Admin, Manager, and Kitchen Staff
router.patch('/:id/availability', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER', 'KITCHEN_STAFF'), updateMenuItemAvailability);

// Write restricted to RESTAURANT_ADMIN and MANAGER
router.post('/', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER'), createMenuItem);
router.put('/:id', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER'), updateMenuItem);
router.delete('/:id', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER'), deleteMenuItem);

export default router;
