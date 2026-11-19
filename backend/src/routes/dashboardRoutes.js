import express from 'express';
import {
  getDashboardStats,
  getRecentOrders,
  getSalesSummary,
  getOrderSummary,
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);
// Accessible by RESTAURANT_ADMIN and MANAGER
router.use(authorizeRoles('RESTAURANT_ADMIN', 'MANAGER'));

router.get('/stats', getDashboardStats);
router.get('/recent-orders', getRecentOrders);
router.get('/sales', getSalesSummary);
router.get('/order-summary', getOrderSummary);

export default router;
