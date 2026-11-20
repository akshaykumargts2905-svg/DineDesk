import express from 'express';
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  updateStaffStatus,
  deleteStaff,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All staff endpoints require authentication
router.use(authenticate);

router.post('/', authorizeRoles('RESTAURANT_ADMIN'), createStaff);
router.get('/', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER'), getAllStaff);
router.get('/:id', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER'), getStaffById);
router.put('/:id', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER'), updateStaff);
router.patch('/:id/status', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER'), updateStaffStatus);
router.delete('/:id', authorizeRoles('RESTAURANT_ADMIN'), deleteStaff);

export default router;
