import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse.js';
import * as incomeService from '../services/incomeService.js';

export const createIncome = asyncHandler(async (req, res) => {
  const income = await incomeService.createIncome(req.user._id, req.body);
  sendCreated(res, income, 'Income added successfully');
});

export const getIncomes = asyncHandler(async (req, res) => {
  const { incomes, pagination } = await incomeService.getIncomes(req.user._id, req.query);
  sendPaginated(res, incomes, pagination);
});

export const getIncome = asyncHandler(async (req, res) => {
  const income = await incomeService.getIncomeById(req.user._id, req.params.id);
  sendSuccess(res, income);
});

export const updateIncome = asyncHandler(async (req, res) => {
  const income = await incomeService.updateIncome(req.user._id, req.params.id, req.body);
  sendSuccess(res, income, 200, 'Income updated successfully');
});

export const deleteIncome = asyncHandler(async (req, res) => {
  await incomeService.deleteIncome(req.user._id, req.params.id);
  sendSuccess(res, null, 200, 'Income deleted successfully');
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await incomeService.getIncomeStats(req.user._id);
  sendSuccess(res, stats);
});
