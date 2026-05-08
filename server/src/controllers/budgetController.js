import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as budgetService from '../services/budgetService.js';

export const setBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.setBudget(req.user._id, req.body);
  sendSuccess(res, budget, 200, 'Budget set successfully');
});

export const getBudgets = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const now = new Date();
  const m = parseInt(month) || now.getMonth() + 1;
  const y = parseInt(year) || now.getFullYear();
  const budgets = await budgetService.getBudgets(req.user._id, m, y);
  sendSuccess(res, budgets);
});

export const deleteBudget = asyncHandler(async (req, res) => {
  await budgetService.deleteBudget(req.user._id, req.params.id);
  sendSuccess(res, null, 200, 'Budget deleted successfully');
});
