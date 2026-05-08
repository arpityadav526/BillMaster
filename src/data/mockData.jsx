// ========== CATEGORIES ==========
import { Utensils, Car, ShoppingBag, Receipt, Film, Activity, BookOpen, Plane, CreditCard, Box } from 'lucide-react'

export const categories = [
  { id: 'food', name: 'Food & Dining', icon: <Utensils className="w-4 h-4 inline" />, color: '#f59e0b' },
  { id: 'transport', name: 'Transportation', icon: <Car className="w-4 h-4 inline" />, color: '#3b82f6' },
  { id: 'shopping', name: 'Shopping', icon: <ShoppingBag className="w-4 h-4 inline" />, color: '#a78bfa' },
  { id: 'bills', name: 'Bills & Utilities', icon: <Receipt className="w-4 h-4 inline" />, color: '#f43f5e' },
  { id: 'entertainment', name: 'Entertainment', icon: <Film className="w-4 h-4 inline" />, color: '#ec4899' },
  { id: 'health', name: 'Healthcare', icon: <Activity className="w-4 h-4 inline" />, color: '#10b981' },
  { id: 'education', name: 'Education', icon: <BookOpen className="w-4 h-4 inline" />, color: '#6366f1' },
  { id: 'travel', name: 'Travel', icon: <Plane className="w-4 h-4 inline" />, color: '#8b5cf6' },
  { id: 'subscriptions', name: 'Subscriptions', icon: <CreditCard className="w-4 h-4 inline" />, color: '#f59e0b' },
  { id: 'other', name: 'Other', icon: <Box className="w-4 h-4 inline" />, color: '#64748b' },
];

// ========== TRANSACTIONS ==========
export const transactions = [
  { id: 1, description: 'Whole Foods Market', category: 'food', amount: 87.34, date: '2026-05-08', type: 'expense', status: 'completed' },
  { id: 2, description: 'Uber Ride - Airport', category: 'transport', amount: 42.50, date: '2026-05-07', type: 'expense', status: 'completed' },
  { id: 3, description: 'Netflix Subscription', category: 'subscriptions', amount: 15.99, date: '2026-05-07', type: 'expense', status: 'completed' },
  { id: 4, description: 'Amazon Purchase', category: 'shopping', amount: 129.99, date: '2026-05-06', type: 'expense', status: 'completed' },
  { id: 5, description: 'Electric Bill - May', category: 'bills', amount: 156.80, date: '2026-05-05', type: 'expense', status: 'completed' },
  { id: 6, description: 'Gym Membership', category: 'health', amount: 49.99, date: '2026-05-05', type: 'expense', status: 'completed' },
  { id: 7, description: 'Spotify Premium', category: 'subscriptions', amount: 9.99, date: '2026-05-04', type: 'expense', status: 'completed' },
  { id: 8, description: 'Gas Station', category: 'transport', amount: 55.20, date: '2026-05-04', type: 'expense', status: 'completed' },
  { id: 9, description: 'Movie Tickets', category: 'entertainment', amount: 32.00, date: '2026-05-03', type: 'expense', status: 'completed' },
  { id: 10, description: 'Coursera Course', category: 'education', amount: 39.99, date: '2026-05-03', type: 'expense', status: 'completed' },
  { id: 11, description: 'Restaurant - Italian', category: 'food', amount: 78.50, date: '2026-05-02', type: 'expense', status: 'completed' },
  { id: 12, description: 'Flight to NYC', category: 'travel', amount: 289.00, date: '2026-05-01', type: 'expense', status: 'pending' },
  { id: 13, description: 'Internet Bill', category: 'bills', amount: 79.99, date: '2026-05-01', type: 'expense', status: 'completed' },
  { id: 14, description: 'Apple Store', category: 'shopping', amount: 199.00, date: '2026-04-30', type: 'expense', status: 'completed' },
  { id: 15, description: 'Pharmacy', category: 'health', amount: 23.45, date: '2026-04-29', type: 'expense', status: 'completed' },
  { id: 16, description: 'Coffee Shop', category: 'food', amount: 12.80, date: '2026-04-28', type: 'expense', status: 'completed' },
  { id: 17, description: 'Parking Fee', category: 'transport', amount: 18.00, date: '2026-04-28', type: 'expense', status: 'completed' },
  { id: 18, description: 'Book Purchase', category: 'education', amount: 24.99, date: '2026-04-27', type: 'expense', status: 'completed' },
  { id: 19, description: 'Concert Tickets', category: 'entertainment', amount: 95.00, date: '2026-04-26', type: 'expense', status: 'completed' },
  { id: 20, description: 'Hotel Stay - NYC', category: 'travel', amount: 345.00, date: '2026-04-25', type: 'expense', status: 'pending' },
];

// ========== MONTHLY DATA ==========
export const monthlyData = [
  { month: 'Jan', income: 6200, expenses: 4100 },
  { month: 'Feb', income: 6200, expenses: 3800 },
  { month: 'Mar', income: 6500, expenses: 4500 },
  { month: 'Apr', income: 6200, expenses: 3900 },
  { month: 'May', income: 6800, expenses: 4200 },
  { month: 'Jun', income: 6200, expenses: 4800 },
  { month: 'Jul', income: 7000, expenses: 3600 },
  { month: 'Aug', income: 6500, expenses: 4100 },
  { month: 'Sep', income: 6200, expenses: 4400 },
  { month: 'Oct', income: 6800, expenses: 3700 },
  { month: 'Nov', income: 6200, expenses: 5100 },
  { month: 'Dec', income: 7200, expenses: 5800 },
];

// ========== CATEGORY SPENDING ==========
export const categorySpending = [
  { name: 'Food & Dining', value: 890, color: '#f97316' },
  { name: 'Transportation', value: 520, color: '#3b82f6' },
  { name: 'Shopping', value: 680, color: '#a78bfa' },
  { name: 'Bills & Utilities', value: 750, color: '#f43f5e' },
  { name: 'Entertainment', value: 320, color: '#ec4899' },
  { name: 'Health', value: 210, color: '#10b981' },
  { name: 'Subscriptions', value: 180, color: '#f59e0b' },
  { name: 'Other', value: 150, color: '#64748b' },
];

// ========== BUDGET DATA ==========
export const budgets = [
  { category: 'Food & Dining', spent: 890, limit: 1000, color: '#f97316' },
  { category: 'Transportation', spent: 520, limit: 600, color: '#3b82f6' },
  { category: 'Shopping', spent: 680, limit: 500, color: '#a78bfa' },
  { category: 'Bills & Utilities', spent: 750, limit: 800, color: '#f43f5e' },
  { category: 'Entertainment', spent: 320, limit: 400, color: '#ec4899' },
  { category: 'Health & Fitness', spent: 210, limit: 300, color: '#10b981' },
  { category: 'Subscriptions', spent: 180, limit: 200, color: '#f59e0b' },
];

// ========== INSIGHTS ==========
export const insights = [
  { id: 1, type: 'warning', title: 'Shopping Over Budget', description: 'You\'ve exceeded your shopping budget by $180. Consider reducing discretionary spending.', icon: '⚠️' },
  { id: 2, type: 'success', title: 'Transport Savings', description: 'Great job! You saved $80 on transportation compared to last month.', icon: '🎉' },
  { id: 3, type: 'info', title: 'Subscription Review', description: 'You have 3 active subscriptions totaling $45.97/month. Review for unused services.', icon: '💡' },
  { id: 4, type: 'tip', title: 'Savings Opportunity', description: 'Moving dining expenses to home cooking could save you ~$200/month.', icon: '💰' },
];

// ========== ANALYTICS CARDS ==========
export const analyticsCards = [
  { title: 'Total Expenses', value: '$4,247.52', change: '+12.5%', trend: 'up', icon: 'wallet' },
  { title: 'Monthly Budget', value: '$5,800.00', change: '73% used', trend: 'neutral', icon: 'target' },
  { title: 'Savings Rate', value: '27.3%', change: '+3.2%', trend: 'up', icon: 'piggy' },
  { title: 'Pending Bills', value: '$634.00', change: '2 due soon', trend: 'down', icon: 'clock' },
];

// ========== RECEIPTS ==========
export const receipts = [
  { id: 1, name: 'grocery_receipt.jpg', size: '2.4 MB', date: '2026-05-08', status: 'processed', amount: '$87.34', vendor: 'Whole Foods', category: 'food' },
  { id: 2, name: 'uber_receipt.pdf', size: '156 KB', date: '2026-05-07', status: 'processed', amount: '$42.50', vendor: 'Uber', category: 'transport' },
  { id: 3, name: 'electric_bill.pdf', size: '890 KB', date: '2026-05-05', status: 'processing', amount: null, vendor: null, category: null },
  { id: 4, name: 'restaurant_bill.jpg', size: '3.1 MB', date: '2026-05-02', status: 'processed', amount: '$78.50', vendor: 'Olive Garden', category: 'food' },
  { id: 5, name: 'flight_booking.pdf', size: '1.2 MB', date: '2026-05-01', status: 'failed', amount: null, vendor: null, category: null },
];
