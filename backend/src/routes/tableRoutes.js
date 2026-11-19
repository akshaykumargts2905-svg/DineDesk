import express from 'express';
import {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  updateTableStatus,
  deleteTable,
} from '../controllers/tableController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);

// All staff can view tables
router.get('/', getAllTables);
router.get('/:id', getTableById);

// Admin and Manager can manage tables
router.post('/', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER'), createTable);
router.put('/:id', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER'), updateTable);
router.patch('/:id/status', authorizeRoles('RESTAURANT_ADMIN', 'MANAGER'), updateTableStatus);
router.delete('/:id', authorizeRoles('RESTAURANT_ADMIN'), deleteTable);

export default router;
