import Income from '../models/Income.js';
import AppError from '../utils/AppError.js';

export const createIncome = async (userId, data) => {
  const income = await Income.create({ ...data, user: userId });
  return income;
};

export const getIncomes = async (userId, query = {}) => {
  const { page = 1, limit = 10, category, sortBy = 'date', order = 'desc', startDate, endDate } = query;

  const filter = { user: userId };

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [incomes, total] = await Promise.all([
    Income.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Income.countDocuments(filter),
  ]);

  return {
    incomes,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

export const getIncomeById = async (userId, incomeId) => {
  const income = await Income.findOne({ _id: incomeId, user: userId });
  if (!income) throw new AppError('Income not found', 404);
  return income;
};

export const updateIncome = async (userId, incomeId, data) => {
  const income = await Income.findOneAndUpdate(
    { _id: incomeId, user: userId },
    data,
    { new: true, runValidators: true }
  );
  if (!income) throw new AppError('Income not found', 404);
  return income;
};

export const deleteIncome = async (userId, incomeId) => {
  const income = await Income.findOneAndDelete({ _id: incomeId, user: userId });
  if (!income) throw new AppError('Income not found', 404);
  return income;
};

export const getIncomeStats = async (userId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [currentMonth, lastMonth] = await Promise.all([
    Income.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Income.aggregate([
      { $match: { user: userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  return {
    currentMonthTotal: currentMonth[0]?.total || 0,
    lastMonthTotal: lastMonth[0]?.total || 0,
  };
};
