import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import AppError from '../utils/AppError.js';
import { createNotification } from './notificationService.js';
import { sendBudgetExceededAlert } from '../utils/mailer.js';
import User from '../models/User.js';

export const createExpense = async (userId, data) => {
  const expense = await Expense.create({ ...data, user: userId });
  
  // Budget Check logic
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    const budget = await Budget.findOne({ user: userId, category: data.category, month, year });
    
    if (budget) {
      // Calculate total spent in this category for the month
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);
      
      const spending = await Expense.aggregate([
        { $match: { user: userId, category: data.category, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      
      const totalSpent = spending[0]?.total || 0;
      
      if (totalSpent > budget.limit) {
        // Trigger notification
        await createNotification(userId, {
          type: 'warning',
          title: 'Budget Exceeded',
          description: `You have spent ${totalSpent} in ${data.category}, which exceeds your budget of ${budget.limit}.`
        });
        
        // Send Email
        const user = await User.findById(userId);
        if (user && user.email) {
          await sendBudgetExceededAlert(user.email, user.name, data.category, totalSpent, budget.limit);
        }
      } else if (totalSpent > budget.limit * 0.8) {
        // Warning at 80%
        await createNotification(userId, {
          type: 'info',
          title: 'Budget Warning',
          description: `You have used ${Math.round((totalSpent/budget.limit)*100)}% of your ${data.category} budget.`
        });
      }
    }
  } catch (error) {
    // Silent catch for budget check errors
  }

  return expense;
};

export const getExpenses = async (userId, query = {}) => {
  const { page = 1, limit = 10, category, search, sortBy = 'date', order = 'desc', startDate, endDate } = query;

  const filter = { user: userId };

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (search) {
    filter.description = { $regex: search, $options: 'i' };
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Expense.countDocuments(filter),
  ]);

  return {
    expenses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

export const getExpenseById = async (userId, expenseId) => {
  const expense = await Expense.findOne({ _id: expenseId, user: userId });
  if (!expense) throw new AppError('Expense not found', 404);
  return expense;
};

export const updateExpense = async (userId, expenseId, data) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: expenseId, user: userId },
    data,
    { new: true, runValidators: true }
  );
  if (!expense) throw new AppError('Expense not found', 404);
  return expense;
};

export const deleteExpense = async (userId, expenseId) => {
  const expense = await Expense.findOneAndDelete({ _id: expenseId, user: userId });
  if (!expense) throw new AppError('Expense not found', 404);
  return expense;
};

export const getExpenseStats = async (userId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [currentMonth, lastMonth, byCategory, monthlyTrend] = await Promise.all([
    // Current month total
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),

    // Last month total
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // By category (current month)
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),

    // Monthly trend (last 12 months)
    Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const currentTotal = currentMonth[0]?.total || 0;
  const lastTotal = lastMonth[0]?.total || 0;
  const changePercent = lastTotal > 0 ? (((currentTotal - lastTotal) / lastTotal) * 100).toFixed(1) : 0;

  return {
    currentMonth: { total: currentTotal, count: currentMonth[0]?.count || 0 },
    lastMonth: { total: lastTotal },
    changePercent: parseFloat(changePercent),
    byCategory,
    monthlyTrend,
  };
};
