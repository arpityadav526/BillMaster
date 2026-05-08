/**
 * Database seed script — populates dev data for the demo user.
 * Run: npm run seed (from server directory)
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import Notification from '../models/Notification.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/billmaster';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clean existing data
    await Promise.all([
      User.deleteMany({}),
      Expense.deleteMany({}),
      Budget.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('✓ Cleared existing data');

    // Create demo user
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@billmaster.com',
      password: 'demo1234',
      currency: 'USD',
      monthlyIncome: 6500,
    });
    console.log(`✓ Created demo user: ${user.email}`);

    // Create expenses
    const expenses = [
      { description: 'Whole Foods Market', category: 'food', amount: 87.34, date: '2026-05-08', status: 'completed' },
      { description: 'Uber Ride - Airport', category: 'transport', amount: 42.50, date: '2026-05-07', status: 'completed' },
      { description: 'Netflix Subscription', category: 'subscriptions', amount: 15.99, date: '2026-05-07', status: 'completed' },
      { description: 'Amazon Purchase', category: 'shopping', amount: 129.99, date: '2026-05-06', status: 'completed' },
      { description: 'Electric Bill - May', category: 'bills', amount: 156.80, date: '2026-05-05', status: 'completed' },
      { description: 'Gym Membership', category: 'health', amount: 49.99, date: '2026-05-05', status: 'completed' },
      { description: 'Spotify Premium', category: 'subscriptions', amount: 9.99, date: '2026-05-04', status: 'completed' },
      { description: 'Gas Station', category: 'transport', amount: 55.20, date: '2026-05-04', status: 'completed' },
      { description: 'Movie Tickets', category: 'entertainment', amount: 32.00, date: '2026-05-03', status: 'completed' },
      { description: 'Coursera Course', category: 'education', amount: 39.99, date: '2026-05-03', status: 'completed' },
      { description: 'Restaurant - Italian', category: 'food', amount: 78.50, date: '2026-05-02', status: 'completed' },
      { description: 'Flight to NYC', category: 'travel', amount: 289.00, date: '2026-05-01', status: 'pending' },
      { description: 'Internet Bill', category: 'bills', amount: 79.99, date: '2026-05-01', status: 'completed' },
      { description: 'Apple Store', category: 'shopping', amount: 199.00, date: '2026-04-30', status: 'completed' },
      { description: 'Pharmacy', category: 'health', amount: 23.45, date: '2026-04-29', status: 'completed' },
      { description: 'Coffee Shop', category: 'food', amount: 12.80, date: '2026-04-28', status: 'completed' },
      { description: 'Parking Fee', category: 'transport', amount: 18.00, date: '2026-04-28', status: 'completed' },
      { description: 'Book Purchase', category: 'education', amount: 24.99, date: '2026-04-27', status: 'completed' },
      { description: 'Concert Tickets', category: 'entertainment', amount: 95.00, date: '2026-04-26', status: 'completed' },
      { description: 'Hotel Stay - NYC', category: 'travel', amount: 345.00, date: '2026-04-25', status: 'pending' },
    ];

    await Expense.insertMany(expenses.map(e => ({ ...e, user: user._id, date: new Date(e.date) })));
    console.log(`✓ Seeded ${expenses.length} expenses`);

    // Create budgets for current month
    const now = new Date();
    const budgets = [
      { category: 'food', limit: 1000 },
      { category: 'transport', limit: 600 },
      { category: 'shopping', limit: 500 },
      { category: 'bills', limit: 800 },
      { category: 'entertainment', limit: 400 },
      { category: 'health', limit: 300 },
      { category: 'subscriptions', limit: 200 },
    ];

    await Budget.insertMany(budgets.map(b => ({
      ...b, user: user._id, month: now.getMonth() + 1, year: now.getFullYear(),
    })));
    console.log(`✓ Seeded ${budgets.length} budgets`);

    // Create notifications
    const notifications = [
      { type: 'warning', title: 'Shopping Over Budget', description: "You've exceeded your shopping budget by $180. Consider reducing discretionary spending." },
      { type: 'success', title: 'Transport Savings', description: 'Great job! You saved $80 on transportation compared to last month.' },
      { type: 'info', title: 'Subscription Review', description: 'You have 3 active subscriptions totaling $45.97/month. Review for unused services.' },
      { type: 'tip', title: 'Savings Opportunity', description: 'Moving dining expenses to home cooking could save you ~$200/month.' },
    ];

    await Notification.insertMany(notifications.map(n => ({ ...n, user: user._id })));
    console.log(`✓ Seeded ${notifications.length} notifications`);

    console.log('\n✓ Seed completed successfully!');
    console.log('  Login: demo@billmaster.com / demo1234\n');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedData();
