import express from 'express';
import {
  createIncome,
  getIncomes,
  getIncome,
  updateIncome,
  deleteIncome,
  getStats,
} from '../controllers/incomeController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route('/')
  .get(getIncomes)
  .post(createIncome);

router.get('/stats', getStats);

router.route('/:id')
  .get(getIncome)
  .put(updateIncome)
  .delete(deleteIncome);

export default router;
