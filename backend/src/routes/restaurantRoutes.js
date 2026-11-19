import express from 'express';
import {
  createRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  deleteMyRestaurant,
} from '../controllers/restaurantController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('RESTAURANT_ADMIN'), createRestaurant);
router.get('/my', authenticate, getMyRestaurant);
router.put('/my', authenticate, authorizeRoles('RESTAURANT_ADMIN', 'MANAGER'), updateMyRestaurant);
router.delete('/my', authenticate, authorizeRoles('RESTAURANT_ADMIN'), deleteMyRestaurant);

export default router;
