import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import axios from 'axios';
import Notification from '../models/Notification.js';
import { createNotification } from './notificationService.js';

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Build a transaction payload from a user's expenses for the ML service.
 */
async function buildTransactionPayload(userId) {
  const expenses = await Expense.find({ user: userId }).lean();
  return expenses.map(e => ({
    amount: e.amount,
    category: e.category,
    date: e.date instanceof Date ? e.date.toISOString() : e.date,
    description: e.description || '',
  }));
}

export const getAnalyticsOverview = async (userId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [currentMonth, lastMonth] = await Promise.all([
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  return {
    currentMonthTotal: currentMonth[0]?.total || 0,
    lastMonthTotal: lastMonth[0]?.total || 0,
  };
};

/**
 * Get AI-powered insights from the ML service.
 * Also persists high-severity warnings as in-app notifications (once per day).
 */
export const getInsights = async (userId) => {
  const transactions = await buildTransactionPayload(userId);
  if (transactions.length === 0) return [];

  try {
    // Direct call to ML service — NOT through the Node proxy to avoid double-prefix
    const mlResponse = await axios.post(`${ML_URL}/api/ml/analyze`, {
      user_id: userId.toString(),
      transactions,
    }, { timeout: 8000 });

    const insights = mlResponse.data?.insights || [];

    // Persist high-severity warnings as notifications (rate-limited to 1 per title per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const insight of insights) {
      if (insight.severity === 'high' || insight.type === 'warning') {
        const existing = await Notification.findOne({
          user: userId,
          title: insight.title,
          createdAt: { $gte: today },
        });

        if (!existing) {
          await createNotification(userId, {
            type: insight.type,
            title: insight.title,
            description: insight.description,
            read: false,
          }).catch(() => {}); // Silent — don't fail the response if notification creation fails
        }
      }
    }

    return insights;
  } catch (err) {
    // Gracefully degrade if ML service is down
    console.warn('[Analytics] ML service unavailable:', err.message);
    return [];
  }
};

/**
 * Get savings prediction from the ML service.
 */
export const getSavingsPrediction = async (userId) => {
  const transactions = await buildTransactionPayload(userId);

  // Get user's salary & savings target
  const { default: User } = await import('../models/User.js');
  const user = await User.findById(userId).lean();
  const monthlySalary = user?.monthlySalary || 0;
  const targetSavingsAmount = user?.targetSavingsAmount || 0;

  // If no salary set, also check income records for this month
  let effectiveSalary = monthlySalary;
  if (effectiveSalary === 0) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const incomeAgg = await Income.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    effectiveSalary = incomeAgg[0]?.total || 0;
  }

  if (transactions.length === 0) {
    return {
      projected_spend: 0,
      variance: -targetSavingsAmount,
      status: 'on_track',
      advice: 'No spending data yet. Add transactions to get your savings prediction.',
      daily_run_rate: 0,
      current_month_spend: 0,
      days_remaining: 0,
      savings_rate_pct: effectiveSalary > 0 ? 100 : 0,
      monthlySalary: effectiveSalary,
      targetSavingsAmount,
    };
  }

  try {
    const mlResponse = await axios.post(`${ML_URL}/api/ml/predict-savings`, {
      transactions,
      monthlySalary: effectiveSalary,
      targetSavingsAmount,
    }, { timeout: 8000 });

    return {
      ...mlResponse.data,
      monthlySalary: effectiveSalary,
      targetSavingsAmount,
    };
  } catch (err) {
    console.warn('[Analytics] ML predict-savings unavailable:', err.message);
    return {
      projected_spend: 0,
      variance: 0,
      status: 'unknown',
      advice: 'Savings prediction temporarily unavailable. Please ensure the ML service is running.',
      daily_run_rate: 0,
      current_month_spend: 0,
      days_remaining: 0,
      savings_rate_pct: 0,
      monthlySalary: effectiveSalary,
      targetSavingsAmount,
    };
  }
};

/**
 * Send a natural language question to the ML chat endpoint.
 */
export const getChatResponse = async (userId, question) => {
  const transactions = await buildTransactionPayload(userId);
  const { default: User } = await import('../models/User.js');
  const user = await User.findById(userId).lean();

  try {
    const mlResponse = await axios.post(`${ML_URL}/api/ml/chat`, {
      question,
      transactions,
      monthlySalary: user?.monthlySalary || 0,
      targetSavingsAmount: user?.targetSavingsAmount || 0,
      user_id: userId.toString(),
    }, { timeout: 12000 });

    return mlResponse.data?.answer || 'I could not generate an answer. Please try rephrasing.';
  } catch (err) {
    console.warn('[Analytics] ML chat unavailable:', err.message);
    return 'The AI advisor is temporarily unavailable. Please ensure the ML service is running on port 8000.';
  }
};
