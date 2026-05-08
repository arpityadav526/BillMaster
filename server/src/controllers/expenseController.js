import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse.js';
import * as expenseService from '../services/expenseService.js';

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.user._id, req.body);
  sendCreated(res, expense, 'Expense added successfully');
});

export const getExpenses = asyncHandler(async (req, res) => {
  const { expenses, pagination } = await expenseService.getExpenses(req.user._id, req.query);
  sendPaginated(res, expenses, pagination);
});

export const getExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.user._id, req.params.id);
  sendSuccess(res, expense);
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(req.user._id, req.params.id, req.body);
  sendSuccess(res, expense, 200, 'Expense updated successfully');
});

export const deleteExpense = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.user._id, req.params.id);
  sendSuccess(res, null, 200, 'Expense deleted successfully');
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await expenseService.getExpenseStats(req.user._id);
  sendSuccess(res, stats);
});
