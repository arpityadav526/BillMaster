import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import errorHandler from './middleware/errorHandler.js';
import { URL } from 'url';

// Route imports
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import budgetRoutes from './routes/budgets.js';
import receiptRoutes from './routes/receipts.js';
import notificationRoutes from './routes/notifications.js';
import incomeRoutes from './routes/incomes.js';
import connectedAccountRoutes from './routes/connectedAccounts.js';
import analyticsRoutes from './routes/analytics.js';
import userRoutes from './routes/users.js';

const app = express();

// ========== SECURITY MIDDLEWARE ==========
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ========== BODY PARSING ==========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ========== LOGGING ==========
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// ========== STATIC FILES ==========
app.use('/uploads', express.static('uploads'));

// ========== API ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/connected-accounts', connectedAccountRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// Proxy route for ML service
app.use('/api/ml', async (req, res) => {
  try {
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await axios({
      method: req.method,
      url: `${mlUrl}${req.originalUrl}`,
      data: req.body,
      headers: { ...req.headers, host: new URL(mlUrl).host }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('ML Service proxy error:', error.message);
    res.status(500).json({ success: false, message: 'ML Service unavailable' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'BillMaster API is running', timestamp: new Date().toISOString() });
});

// ========== 404 HANDLER ==========
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ========== ERROR HANDLER ==========
app.use(errorHandler);

export default app;
