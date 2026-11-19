import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderStatusHistory,
} from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Creation, listing and viewing
router.post('/', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER', 'FRONT_OF_HOUSE'), createOrder);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.get('/:id/history', getOrderStatusHistory);

// Status updates & edits
router.put('/:id', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER', 'FRONT_OF_HOUSE'), updateOrder);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/cancel', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER', 'FRONT_OF_HOUSE'), cancelOrder);

export default router;
