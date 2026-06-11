import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Budget from '../models/Budget.js';
import User from '../models/User.js';
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

// ─── Helper: Date ranges ──────────────────────────────────────────────────
function getDateRanges() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  return { now, startOfMonth, startOfLastMonth, endOfLastMonth, startOfWeek, startOfYear, thirtyDaysAgo, sixtyDaysAgo, ninetyDaysAgo };
}

// ─── Comprehensive Analytics Dashboard ────────────────────────────────────
export const getAnalyticsDashboard = async (userId) => {
  const dates = getDateRanges();
  const { now, startOfMonth, startOfLastMonth, endOfLastMonth, startOfYear, thirtyDaysAgo, sixtyDaysAgo, ninetyDaysAgo } = dates;

  const user = await User.findById(userId).lean();
  const monthlySalary = user?.monthlySalary || 0;

  const [
    currentMonthAgg,
    lastMonthAgg,
    byCategory,
    monthlyTrend,
    weeklyBreakdown,
    dailySpending,
    topDescriptions,
    paymentMethodBreakdown,
    categoryMonthly,
    currentMonthIncome,
    lastMonthIncome,
    monthlyIncomeTrend,
    currentBudgets,
    totalExpenseCount,
    avgTransaction,
    last30DaysExpenses,
    prev30DaysExpenses,
    yearlyTotal,
  ] = await Promise.all([
    // 1. Current month total + count
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 }, avg: { $avg: '$amount' }, max: { $max: '$amount' }, min: { $min: '$amount' } } },
    ]),
    // 2. Last month total
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    // 3. By category (current month)
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 }, avgAmount: { $avg: '$amount' } } },
      { $sort: { total: -1 } },
    ]),
    // 4. Monthly trend (last 12 months)
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    // 5. Weekly breakdown (day of week spending)
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: ninetyDaysAgo } } },
      { $group: { _id: { $dayOfWeek: '$date' }, total: { $sum: '$amount' }, count: { $sum: 1 }, avg: { $avg: '$amount' } } },
      { $sort: { '_id': 1 } },
    ]),
    // 6. Daily spending (last 90 days for heatmap)
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: ninetyDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      } },
      { $sort: { '_id': 1 } },
    ]),
    // 7. Top descriptions/merchants (last 90 days)
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: ninetyDaysAgo } } },
      { $group: { _id: '$description', total: { $sum: '$amount' }, count: { $sum: 1 }, lastDate: { $max: '$date' }, category: { $first: '$category' } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]),
    // 8. Payment method breakdown (current month)
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    // 9. Category monthly trend (last 6 months, per category)
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      { $group: {
        _id: { category: '$category', year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' },
      } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    // 10. Current month income
    Income.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    // 11. Last month income
    Income.aggregate([
      { $match: { user: userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    // 12. Monthly income trend (last 12 months)
    Income.aggregate([
      { $match: { user: userId, date: { $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    // 13. Current month budgets
    Budget.find({ user: userId, month: now.getMonth() + 1, year: now.getFullYear() }).lean(),
    // 14. Total expense count (all time)
    Expense.countDocuments({ user: userId }),
    // 15. Average transaction (all time)
    Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, avg: { $avg: '$amount' } } },
    ]),
    // 16. Last 30 days expenses
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    // 17. Previous 30 days expenses (30-60 days ago)
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    // 18. Yearly total
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
  ]);

  // ── Compute derived metrics ───────────────────────────────────────────
  const currentTotal = currentMonthAgg[0]?.total || 0;
  const lastTotal = lastMonthAgg[0]?.total || 0;
  const changePercent = lastTotal > 0 ? (((currentTotal - lastTotal) / lastTotal) * 100) : 0;

  const currentIncomeTotal = currentMonthIncome[0]?.total || (monthlySalary > 0 ? monthlySalary : 0);
  const lastIncomeTotal = lastMonthIncome[0]?.total || monthlySalary;

  const netCashFlow = currentIncomeTotal - currentTotal;
  const savingsRate = currentIncomeTotal > 0 ? ((currentIncomeTotal - currentTotal) / currentIncomeTotal * 100) : 0;

  // Daily run rate
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyRunRate = dayOfMonth > 0 ? currentTotal / dayOfMonth : 0;
  const projectedMonthEnd = dailyRunRate * daysInMonth;
  const daysRemaining = daysInMonth - dayOfMonth;

  // Week over week change
  const last30Total = last30DaysExpenses[0]?.total || 0;
  const prev30Total = prev30DaysExpenses[0]?.total || 0;
  const thirtyDayChange = prev30Total > 0 ? ((last30Total - prev30Total) / prev30Total * 100) : 0;

  // ── Build budget comparison with spent ────────────────────────────────
  const budgetComparison = [];
  for (const b of currentBudgets) {
    const catExpense = byCategory.find(c => c._id === b.category);
    budgetComparison.push({
      category: b.category,
      limit: b.limit,
      spent: catExpense?.total || 0,
      percentage: catExpense ? Math.round((catExpense.total / b.limit) * 100) : 0,
    });
  }

  // ── Build category trends (sparkline data per category) ───────────────
  const categoryTrends = {};
  for (const item of categoryMonthly) {
    const cat = item._id.category;
    if (!categoryTrends[cat]) categoryTrends[cat] = [];
    categoryTrends[cat].push({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      total: item.total,
    });
  }

  // ── Build combined monthly trend with income ──────────────────────────
  const combinedTrend = monthlyTrend.map(t => {
    const incomeEntry = monthlyIncomeTrend.find(
      i => i._id.year === t._id.year && i._id.month === t._id.month
    );
    return {
      year: t._id.year,
      month: t._id.month,
      expenses: t.total,
      income: incomeEntry?.total || monthlySalary,
      savings: (incomeEntry?.total || monthlySalary) - t.total,
      transactionCount: t.count,
    };
  });

  // ── Day of week labels ────────────────────────────────────────────────
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = dayLabels.map((label, i) => {
    const entry = weeklyBreakdown.find(w => w._id === i + 1);
    return {
      day: label,
      total: entry?.total || 0,
      count: entry?.count || 0,
      avg: entry?.avg || 0,
    };
  });

  // ── Financial Health Score (0-100) ────────────────────────────────────
  let healthScore = 50; // Base score
  // Savings rate contribution (max 30 pts)
  if (savingsRate >= 30) healthScore += 30;
  else if (savingsRate >= 20) healthScore += 25;
  else if (savingsRate >= 10) healthScore += 15;
  else if (savingsRate >= 0) healthScore += Math.max(0, savingsRate);
  else healthScore -= 10;

  // Budget adherence (max 20 pts)
  if (budgetComparison.length > 0) {
    const avgAdherence = budgetComparison.reduce((sum, b) => sum + Math.min(100, b.percentage), 0) / budgetComparison.length;
    if (avgAdherence <= 80) healthScore += 20;
    else if (avgAdherence <= 100) healthScore += 10;
    else healthScore -= 5;
  } else {
    healthScore += 5; // Neutral if no budgets
  }

  // Spending trend (max 10 pts) — reward decreasing spend
  if (changePercent < -10) healthScore += 10;
  else if (changePercent < 0) healthScore += 5;
  else if (changePercent > 20) healthScore -= 10;

  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  let healthLabel = 'Poor';
  if (healthScore >= 80) healthLabel = 'Excellent';
  else if (healthScore >= 65) healthLabel = 'Good';
  else if (healthScore >= 45) healthLabel = 'Fair';

  return {
    // Summary
    summary: {
      currentMonthExpenses: currentTotal,
      currentMonthExpenseCount: currentMonthAgg[0]?.count || 0,
      lastMonthExpenses: lastTotal,
      lastMonthExpenseCount: lastMonthAgg[0]?.count || 0,
      changePercent: parseFloat(changePercent.toFixed(1)),
      currentMonthIncome: currentIncomeTotal,
      lastMonthIncome: lastIncomeTotal,
      netCashFlow,
      savingsRate: parseFloat(savingsRate.toFixed(1)),
      dailyRunRate: parseFloat(dailyRunRate.toFixed(2)),
      projectedMonthEnd: parseFloat(projectedMonthEnd.toFixed(2)),
      daysRemaining,
      dayOfMonth,
      daysInMonth,
      avgTransaction: avgTransaction[0]?.avg || 0,
      totalTransactions: totalExpenseCount,
      yearlyTotal: yearlyTotal[0]?.total || 0,
      thirtyDayChange: parseFloat(thirtyDayChange.toFixed(1)),
      monthlySalary,
    },
    // Financial Health
    healthScore: {
      score: healthScore,
      label: healthLabel,
      savingsRate: parseFloat(savingsRate.toFixed(1)),
      budgetAdherence: budgetComparison.length > 0
        ? parseFloat((budgetComparison.reduce((s, b) => s + Math.min(100, b.percentage), 0) / budgetComparison.length).toFixed(1))
        : null,
      spendingTrend: parseFloat(changePercent.toFixed(1)),
    },
    // Category breakdown
    byCategory,
    // Monthly trend with income
    monthlyTrend: combinedTrend,
    // Weekly spending pattern
    weeklyPattern: weeklyData,
    // Daily heatmap
    dailyHeatmap: dailySpending,
    // Top merchants
    topMerchants: topDescriptions,
    // Payment methods
    paymentMethods: paymentMethodBreakdown,
    // Budget comparison
    budgetComparison,
    // Category trends (sparklines)
    categoryTrends,
  };
};


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
