import axios from 'axios';
import cron from 'node-cron';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import Income from '../models/Income.js';
import { sendMonthlyReport, sendEmail, sendWeeklyInsightReport } from '../utils/mailer.js';
import { createNotification } from '../services/notificationService.js';

export const initScheduler = () => {
  console.log('Initializing BillMaster Automated Schedulers...');

  // 1. Monthly Financial Report (1st of every month at 00:01)
  cron.schedule('1 0 1 * *', async () => {
    console.log('Running Monthly Financial Report Job...');
    try {
      const users = await User.find({}).lean();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const monthName = lastMonth.toLocaleString('default', { month: 'long' });
      
      for (const user of users) {
        // Calculate basic stats for the email
        const startOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const endOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
        
        const [expenses, incomes] = await Promise.all([
          Expense.aggregate([
            { $match: { user: user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ]),
          Income.aggregate([
            { $match: { user: user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ])
        ]);

        const totalExpenses = expenses[0]?.total || 0;
        const totalIncomes = incomes[0]?.total || 0;
        const savingsRate = totalIncomes > 0 ? (((totalIncomes - totalExpenses) / totalIncomes) * 100).toFixed(1) : 0;

        await sendMonthlyReport(user.email, user.name, {
          month: monthName,
          totalIncome: totalIncomes,
          totalExpenses,
          topCategory: 'Analyzed in App',
          savingsRate
        });
      }
    } catch (err) {
      console.error('Monthly Report Job failed:', err);
    }
  });

  // 2. Weekly Spending Insights (Every Sunday at 10:00 AM)
  cron.schedule('0 10 * * 0', async () => {
    console.log('Running Weekly Insights Job...');
    try {
      const users = await User.find({ 'preferences.notifications': true }).lean();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      for (const user of users) {
        // Fetch last 7 days of expenses
        const expenses = await Expense.find({
          user: user._id,
          date: { $gte: sevenDaysAgo }
        }).lean();

        if (expenses.length === 0) continue;

        // Fetch all transactions for the current month for EOM projection
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const allMonthExpenses = await Expense.find({
          user: user._id,
          date: { $gte: startOfMonth }
        }).lean();

        // Call ML Service
        try {
          const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/api/ml/predict-savings`, {
            transactions: allMonthExpenses.map(e => ({
              amount: e.amount,
              category: e.category,
              date: e.date.toISOString()
            })),
            monthlySalary: user.monthlySalary || 0,
            targetSavingsAmount: user.targetSavingsAmount || 0
          });

          const mlData = mlResponse.data;

          // Calculate category breakdown for the email
          const catMap = {};
          expenses.forEach(e => {
            catMap[e.category] = (catMap[e.category] || 0) + e.amount;
          });
          const categories = Object.entries(catMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

          await sendWeeklyInsightReport(user.email, user.name, {
            totalSpent: expenses.reduce((acc, e) => acc + e.amount, 0),
            projectedSpend: mlData.projected_spend,
            advice: mlData.advice,
            status: mlData.status,
            categories
          });

          await createNotification(user._id, {
            type: mlData.status === 'at_risk' ? 'warning' : 'tip',
            title: 'Weekly Insight Ready',
            description: mlData.advice
          });
        } catch (mlErr) {
          console.error(`ML Service call failed for user ${user._id}:`, mlErr.message);
        }
      }
    } catch (err) {
      console.error('Weekly Insights Job failed:', err);
    }
  });

  // 3. 3-Day End-of-Month Budget Reminder (27th or 28th of month)
  cron.schedule('0 18 27-28 * *', async () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    if (now.getDate() === lastDay - 3) {
      console.log('Running End-of-Month Budget Reminder...');
      const users = await User.find({}).lean();
      for (const user of users) {
         await sendEmail(user.email, '📅 Month-end Budget Review', 
           'Just 3 days left this month! Check your BillMaster dashboard to ensure you stay within your limits.');
      }
    }
  });

  // 4. Upcoming Salary Reminder (Daily check)
  cron.schedule('0 9 * * *', async () => {
    console.log('Running Salary Reminder Job...');
    try {
      const users = await User.find({}).lean();
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
      
      for (const user of users) {
        const recurringIncomes = await Income.find({ 
          user: user._id, 
          isRecurring: true, 
          category: 'salary',
          frequency: 'monthly'
        }).lean();

        for (const inc of recurringIncomes) {
          const lastDate = new Date(inc.date);
          const nextExpected = new Date(lastDate);
          nextExpected.setMonth(nextExpected.getMonth() + 1);
          
          if (nextExpected.toDateString() === twoDaysFromNow.toDateString()) {
            await sendEmail(user.email, '💸 Upcoming Salary Reminder', 
              `Hello ${user.name}, your recurring salary of ${inc.amount} from ${inc.source} is expected in 2 days!`);
          }
        }
      }
    } catch (err) {
      console.error('Salary Reminder Job failed:', err);
    }
  });

  console.log('Schedulers set: Monthly Report, Weekly Insights, End-of-Month Reminders, Salary Alerts.');
};
