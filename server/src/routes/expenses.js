import express from 'express';
import { createExpense, getExpenses, getExpense, updateExpense, deleteExpense, getStats } from '../controllers/expenseController.js';
import protect from '../middleware/auth.js';
import { validateExpense } from '../validators/index.js';

const router = express.Router();

// All expense routes are protected
router.use(protect);

router.get('/stats', getStats);
router.route('/')
  .get(getExpenses)
  .post(validateExpense, createExpense);

router.route('/:id')
  .get(getExpense)
  .put(validateExpense, updateExpense)
  .delete(deleteExpense);

export default router;
