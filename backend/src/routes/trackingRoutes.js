import express from 'express';
import {
  getActiveOrders,
  trackOrderById,
  markOrderServed,
  completeOrder,
} from '../controllers/trackingController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Accessible by FRONT_OF_HOUSE, MANAGER, RESTAURANT_ADMIN
router.get('/orders', authorizeRoles('FRONT_OF_HOUSE', 'MANAGER', 'RESTAURANT_ADMIN'), getActiveOrders);
router.get('/orders/:id', authorizeRoles('FRONT_OF_HOUSE', 'MANAGER', 'RESTAURANT_ADMIN'), trackOrderById);
router.patch('/orders/:id/served', authorizeRoles('FRONT_OF_HOUSE', 'MANAGER', 'RESTAURANT_ADMIN'), markOrderServed);
router.patch('/orders/:id/complete', authorizeRoles('FRONT_OF_HOUSE', 'MANAGER', 'RESTAURANT_ADMIN'), completeOrder);

export default router;
