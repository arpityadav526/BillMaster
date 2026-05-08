import ConnectedAccount from '../models/ConnectedAccount.js';
import Expense from '../models/Expense.js';
import AppError from '../utils/AppError.js';

export const getConnectedAccounts = async (userId) => {
  return await ConnectedAccount.find({ user: userId });
};

export const connectAccount = async (userId, data) => {
  const account = await ConnectedAccount.findOneAndUpdate(
    { user: userId, provider: data.provider },
    { ...data, status: 'connected', lastSynced: Date.now() },
    { upsert: true, new: true, runValidators: true }
  );
  return account;
};

export const disconnectAccount = async (userId, accountId) => {
  const account = await ConnectedAccount.findOneAndUpdate(
    { _id: accountId, user: userId },
    { status: 'disconnected' },
    { new: true }
  );
  if (!account) throw new AppError('Account not found', 404);
  return account;
};

export const importTransactions = async (userId, accountId, transactions) => {
  const account = await ConnectedAccount.findOne({ _id: accountId, user: userId });
  if (!account) throw new AppError('Account not found', 404);

  const expensesToInsert = transactions.map(tx => ({
    user: userId,
    description: tx.description || 'Imported Transaction',
    amount: tx.amount,
    category: tx.category || 'other',
    date: tx.date || new Date(),
    paymentMethod: account.provider === 'google_pay' || account.provider === 'phonepe' || account.provider === 'paytm' ? 'upi' : 'bank_transfer',
    notes: `Imported from ${account.provider}`,
  }));

  const inserted = await Expense.insertMany(expensesToInsert);
  
  account.lastSynced = Date.now();
  await account.save();

  // Trigger Email Confirmation
  try {
    const User = (await import('../models/User.js')).default;
    const { sendImportConfirmation } = await import('../utils/mailer.js');
    const user = await User.findById(userId);
    if (user && user.email) {
      await sendImportConfirmation(user.email, user.name, inserted.length, account.provider);
    }
  } catch (error) {
    console.error('Failed to send import confirmation:', error);
  }

  return { importedCount: inserted.length };
};
