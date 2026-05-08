import Expense from '../models/Expense.js';
import AppError from '../utils/AppError.js';

export const createExpense = async (userId, data) => {
  const expense = await Expense.create({ ...data, user: userId });
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
