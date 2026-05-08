import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import AppError from '../utils/AppError.js';

export const setBudget = async (userId, data) => {
  const budget = await Budget.findOneAndUpdate(
    { user: userId, category: data.category, month: data.month, year: data.year },
    { limit: data.limit },
    { upsert: true, new: true, runValidators: true }
  );
  return budget;
};

export const getBudgets = async (userId, month, year) => {
  const budgets = await Budget.find({ user: userId, month, year }).lean();

  // Calculate spent amounts for each budget
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const spending = await Expense.aggregate([
    { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
    { $group: { _id: '$category', spent: { $sum: '$amount' } } },
  ]);

  const spendingMap = {};
  spending.forEach((s) => { spendingMap[s._id] = s.spent; });

  return budgets.map((b) => ({
    ...b,
    spent: spendingMap[b.category] || 0,
    percentage: Math.round(((spendingMap[b.category] || 0) / b.limit) * 100),
  }));
};

export const deleteBudget = async (userId, budgetId) => {
  const budget = await Budget.findOneAndDelete({ _id: budgetId, user: userId });
  if (!budget) throw new AppError('Budget not found', 404);
  return budget;
};
