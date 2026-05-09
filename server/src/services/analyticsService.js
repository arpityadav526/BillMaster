import Expense from '../models/Expense.js';
import axios from 'axios';
import AppError from '../utils/AppError.js';
import Notification from '../models/Notification.js';
import { createNotification } from './notificationService.js';

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

export const getInsights = async (userId) => {
  const expenses = await Expense.find({ user: userId }).lean();
  
  if (expenses.length === 0) return [];

  const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  try {
    const mlResponse = await axios.post(`${mlUrl}/api/ml/analyze`, {
      user_id: userId.toString(),
      transactions: expenses.map(e => ({
        amount: e.amount,
        category: e.category,
        date: e.date.toISOString(),
      }))
    });
    
    const insights = mlResponse.data.insights || [];
    
    // Automatically generate notifications for warnings (limit to 1 per day to avoid spam)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const insight of insights) {
      if (insight.severity === 'high' || insight.type === 'warning') {
        const existing = await Notification.findOne({
          user: userId,
          title: insight.title,
          createdAt: { $gte: today }
        });
        
        if (!existing) {
          await createNotification(userId, {
            type: insight.type,
            title: insight.title,
            description: insight.description,
            read: false
          });
        }
      }
    }
    
    return insights;
  } catch (err) {
    return []; // Gracefully fail if ML service is down
  }
};
