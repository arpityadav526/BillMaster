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

  return { importedCount: inserted.length };
};
