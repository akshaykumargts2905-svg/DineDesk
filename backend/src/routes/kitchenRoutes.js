import express from 'express';
import {
  getKitchenOrders,
  getKitchenOrderById,
  acceptKitchenOrder,
  startKitchenPreparation,
  markKitchenOrderReady,
} from '../controllers/kitchenController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);
// Accessible by KITCHEN_STAFF, MANAGER, and RESTAURANT_ADMIN
router.use(authorizeRoles('KITCHEN_STAFF', 'MANAGER', 'RESTAURANT_ADMIN'));

router.get('/orders', getKitchenOrders);
router.get('/orders/:id', getKitchenOrderById);
router.patch('/orders/:id/accept', acceptKitchenOrder);
router.patch('/orders/:id/start', startKitchenPreparation);
router.patch('/orders/:id/ready', markKitchenOrderReady);

export default router;
