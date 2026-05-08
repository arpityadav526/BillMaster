import express from 'express';
import { setBudget, getBudgets, deleteBudget } from '../controllers/budgetController.js';
import protect from '../middleware/auth.js';
import { validateBudget } from '../validators/index.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getBudgets)
  .post(validateBudget, setBudget);

router.delete('/:id', deleteBudget);

export default router;
