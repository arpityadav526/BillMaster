/**
 * EmailSyncJob — Background synchronization service for Gmail-based expense tracking.
 *
 * Responsibilities:
 * 1. Periodically fetch unread transaction emails for all connected Gmail users
 * 2. Parse emails using the ParserFactory
 * 3. Categorize transactions using the CategorizationService
 * 4. Detect and skip duplicate transactions
 * 5. Save new transactions to the database
 * 6. Emit real-time Socket.io events for dashboard updates
 * 7. Create smart notifications with spending insights
 *
 * Runs every 15 minutes via node-cron (registered in scheduler.js).
 */
import ConnectedAccount from '../../models/ConnectedAccount.js';
import Expense from '../../models/Expense.js';
import Income from '../../models/Income.js';
import Budget from '../../models/Budget.js';
import { fetchTransactionEmails, extractEmailContent } from '../gmail/GmailService.js';
import parserFactory from '../parsers/ParserFactory.js';
import { categorize } from '../CategorizationService.js';
import { createNotification } from '../notificationService.js';

/**
 * Main sync function — iterates through all connected Gmail accounts
 * and processes new transaction emails.
 * @param {object} io - Socket.io server instance (for real-time updates)
 */
export async function syncAllAccounts(io) {
  console.log('[EmailSync] Starting email sync for all connected Gmail accounts...');

  try {
    // Find all actively connected Gmail accounts
    const accounts = await ConnectedAccount.find({
      provider: 'gmail',
      status: 'connected',
    }).lean();

    if (accounts.length === 0) {
      console.log('[EmailSync] No connected Gmail accounts found. Skipping.');
      return;
    }

    console.log(`[EmailSync] Found ${accounts.length} connected account(s).`);

    // Process each account sequentially to avoid rate limiting
    for (const account of accounts) {
      try {
        await syncSingleAccount(account, io);
      } catch (err) {
        console.error(`[EmailSync] Error syncing user ${account.user}:`, err.message);
        // Continue with other accounts even if one fails
      }
    }

    console.log('[EmailSync] Email sync completed.');
  } catch (err) {
    console.error('[EmailSync] Fatal error during sync:', err.message);
  }
}

/**
 * Sync a single user's Gmail account.
 * @param {object} account - ConnectedAccount document (lean)
 * @param {object} io - Socket.io server instance
 */
async function syncSingleAccount(account, io) {
  const userId = account.user;
  console.log(`[EmailSync] Syncing user: ${userId}`);

  // Use lastSynced date for incremental email fetching
  const afterDate = account.lastSynced ? account.lastSynced.toISOString() : null;

  // Fetch transaction emails from Gmail
  const emails = await fetchTransactionEmails(userId.toString(), {
    maxResults: 20,
    afterDate,
  });

  if (emails.length === 0) {
    console.log(`[EmailSync] No new emails for user ${userId}.`);
    await updateLastSynced(userId);
    return;
  }

  console.log(`[EmailSync] Fetched ${emails.length} email(s) for user ${userId}.`);

  let newTransactions = 0;
  let skippedDuplicates = 0;
  let unparseable = 0;

  for (const rawEmail of emails) {
    try {
      // Extract readable content from the raw Gmail message
      const emailContent = extractEmailContent(rawEmail);

      // Check if this email has already been processed (duplicate detection via rawEmailId)
      const isDuplicate = await checkDuplicate(emailContent.messageId);
      if (isDuplicate) {
        skippedDuplicates++;
        continue;
      }

      // Parse the email using the appropriate parser
      const result = parserFactory.parseEmail(emailContent);
      if (!result) {
        unparseable++;
        continue;
      }

      const { transaction } = result;

      // Auto-categorize the merchant
      const category = categorize(transaction.merchant);

      // Save the transaction
      const saved = await saveTransaction(userId, transaction, category);
      if (saved) {
        newTransactions++;

        // Emit real-time event via Socket.io
        if (io) {
          io.to(`user:${userId}`).emit('GMAIL_TRANSACTION_IMPORTED', {
            type: transaction.type,
            amount: transaction.amount,
            merchant: transaction.merchant,
            category,
            date: transaction.date,
          });
        }
      }
    } catch (err) {
      console.error(`[EmailSync] Error processing email for user ${userId}:`, err.message);
    }
  }

  // Update last synced timestamp
  await updateLastSynced(userId);

  console.log(`[EmailSync] User ${userId} — New: ${newTransactions}, Duplicates: ${skippedDuplicates}, Unparseable: ${unparseable}`);

  // Generate smart notifications if new transactions were imported
  if (newTransactions > 0) {
    await generateSmartNotifications(userId, newTransactions, io);
  }
}

// ========== Duplicate Detection ==========

/**
 * Check if a transaction email has already been imported.
 * Uses rawEmailId (Gmail message ID) as the primary dedup key.
 * Also checks by UPI reference number as a secondary key.
 * @param {string} rawEmailId - Gmail message ID
 * @param {string} [upiRef] - UPI reference number
 * @returns {boolean}
 */
async function checkDuplicate(rawEmailId, upiRef) {
  // Check in expenses
  const expenseDup = await Expense.findOne({
    $or: [
      { rawEmailId },
      ...(upiRef ? [{ upiReferenceNumber: upiRef }] : []),
    ],
  }).lean();

  if (expenseDup) return true;

  // Check in incomes
  const incomeDup = await Income.findOne({
    $or: [
      { rawEmailId },
      ...(upiRef ? [{ upiReferenceNumber: upiRef }] : []),
    ],
  }).lean();

  return !!incomeDup;
}

// ========== Transaction Saving ==========

/**
 * Save a parsed transaction to the appropriate collection (Expense or Income).
 * @param {string} userId
 * @param {object} transaction - Parsed transaction from a parser
 * @param {string} category - Auto-assigned category
 * @returns {object|null} The saved document, or null if save failed
 */
async function saveTransaction(userId, transaction, category) {
  try {
    if (transaction.type === 'income') {
      const income = await Income.create({
        user: userId,
        source: transaction.merchant,
        amount: transaction.amount,
        date: transaction.date,
        category: 'other',  // Income categories are different from expense categories
        notes: transaction.description,
        isAutomated: true,
        rawEmailId: transaction.rawEmailId,
        upiReferenceNumber: transaction.upiReferenceNumber,
      });
      return income;
    } else {
      const expense = await Expense.create({
        user: userId,
        description: transaction.description,
        amount: transaction.amount,
        category,
        date: transaction.date,
        status: transaction.status || 'completed',
        paymentMethod: transaction.paymentMethod || 'upi',
        notes: `Auto-imported from ${transaction.emailProvider}`,
        isAutomated: true,
        rawEmailId: transaction.rawEmailId,
        upiReferenceNumber: transaction.upiReferenceNumber,
        emailProvider: transaction.emailProvider,
      });
      return expense;
    }
  } catch (err) {
    // Handle duplicate key error gracefully (concurrent sync race condition)
    if (err.code === 11000) {
      console.log(`[EmailSync] Duplicate detected during save (rawEmailId collision) — skipping.`);
      return null;
    }
    throw err;
  }
}

// ========== Smart Notifications ==========

/**
 * Generate intelligent spending notifications after importing new transactions.
 * Instead of "You spent ₹500", provides insights like budget usage and trend analysis.
 * @param {string} userId
 * @param {number} newCount - Number of new transactions imported
 * @param {object} io - Socket.io instance
 */
async function generateSmartNotifications(userId, newCount, io) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get monthly spending totals by category
    const monthlyExpenses = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);

    const totalMonthlySpend = monthlyExpenses.reduce((sum, e) => sum + e.total, 0);

    // Check budget usage
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const budgets = await Budget.find({
      user: userId,
      month: currentMonth,
      year: currentYear,
    }).lean();

    const notifications = [];

    // 1. Budget utilization alerts
    for (const budget of budgets) {
      const categorySpend = monthlyExpenses.find(e => e._id === budget.category);
      if (categorySpend) {
        const utilization = (categorySpend.total / budget.limit) * 100;

        if (utilization >= 100) {
          notifications.push({
            type: 'warning',
            title: `${budget.category} Budget Exceeded`,
            description: `You've spent ₹${categorySpend.total.toLocaleString('en-IN')} on ${budget.category}, exceeding your ₹${budget.limit.toLocaleString('en-IN')} budget by ${(utilization - 100).toFixed(0)}%.`,
          });
        } else if (utilization >= 80) {
          notifications.push({
            type: 'warning',
            title: `${budget.category} Budget Alert`,
            description: `You have used ${utilization.toFixed(0)}% of your monthly ${budget.category} budget (₹${categorySpend.total.toLocaleString('en-IN')} of ₹${budget.limit.toLocaleString('en-IN')}).`,
          });
        }
      }
    }

    // 2. Month-over-month spending trend
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const lastMonthExpenses = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);

    for (const current of monthlyExpenses) {
      const previous = lastMonthExpenses.find(e => e._id === current._id);
      if (previous && previous.total > 0) {
        const changePercent = ((current.total - previous.total) / previous.total) * 100;
        if (changePercent > 25) {
          notifications.push({
            type: 'tip',
            title: `${current._id} Spending Up`,
            description: `${current._id} spending increased by ${changePercent.toFixed(0)}% compared to last month (₹${current.total.toLocaleString('en-IN')} vs ₹${previous.total.toLocaleString('en-IN')}).`,
          });
        }
      }
    }

    // 3. Total monthly spending notification
    if (totalMonthlySpend > 0) {
      notifications.push({
        type: 'info',
        title: `${newCount} Transaction(s) Auto-Imported`,
        description: `Total spending this month: ₹${totalMonthlySpend.toLocaleString('en-IN')}. ${newCount} new transaction(s) were automatically imported from your Gmail.`,
      });
    }

    // Save and emit notifications
    for (const notif of notifications) {
      const saved = await createNotification(userId, notif);

      if (io) {
        io.to(`user:${userId}`).emit('NOTIFICATION_RECEIVED', saved);
      }
    }
  } catch (err) {
    console.error(`[EmailSync] Smart notification error for user ${userId}:`, err.message);
  }
}

// ========== Utility ==========

/**
 * Update the lastSynced timestamp on the connected Gmail account.
 * @param {string} userId
 */
async function updateLastSynced(userId) {
  await ConnectedAccount.findOneAndUpdate(
    { user: userId, provider: 'gmail' },
    { lastSynced: new Date() }
  );
}

/**
 * Manually trigger a sync for a specific user (from the API controller).
 * @param {string} userId
 * @param {object} io - Socket.io instance
 * @returns {{ newTransactions: number, message: string }}
 */
export async function syncSingleUser(userId, io) {
  const account = await ConnectedAccount.findOne({
    user: userId,
    provider: 'gmail',
    status: 'connected',
  }).lean();

  if (!account) {
    return { newTransactions: 0, message: 'Gmail not connected.' };
  }

  await syncSingleAccount(account, io);
  return { newTransactions: 0, message: 'Sync completed. Check dashboard for new transactions.' };
}
