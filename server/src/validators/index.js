import AppError from '../utils/AppError.js';

/**
 * Generic validation middleware factory.
 * Takes a validation function that returns an array of error messages.
 */
const validate = (validationFn) => (req, res, next) => {
  const errors = validationFn(req.body);
  if (errors.length > 0) {
    throw new AppError(errors.join('. '), 400);
  }
  next();
};

// ========== AUTH VALIDATORS ==========

export const validateRegister = validate((body) => {
  const errors = [];
  if (!body.name?.trim()) errors.push('Name is required');
  if (!body.email?.trim()) errors.push('Email is required');
  else if (!/^\S+@\S+\.\S+$/.test(body.email)) errors.push('Invalid email format');
  if (!body.password) errors.push('Password is required');
  else if (body.password.length < 6) errors.push('Password must be at least 6 characters');
  return errors;
});

export const validateLogin = validate((body) => {
  const errors = [];
  if (!body.email?.trim()) errors.push('Email is required');
  if (!body.password) errors.push('Password is required');
  return errors;
});

// ========== EXPENSE VALIDATORS ==========

const VALID_CATEGORIES = [
  'food', 'transport', 'shopping', 'bills', 'entertainment',
  'health', 'education', 'travel', 'subscriptions', 'other',
];

export const validateExpense = validate((body) => {
  const errors = [];
  if (!body.description?.trim()) errors.push('Description is required');
  if (body.amount == null || body.amount <= 0) errors.push('Amount must be a positive number');
  if (!body.category) errors.push('Category is required');
  else if (!VALID_CATEGORIES.includes(body.category)) errors.push('Invalid category');
  if (!body.date) errors.push('Date is required');
  return errors;
});

// ========== BUDGET VALIDATORS ==========

export const validateBudget = validate((body) => {
  const errors = [];
  if (!body.category) errors.push('Category is required');
  else if (!VALID_CATEGORIES.includes(body.category)) errors.push('Invalid category');
  if (body.limit == null || body.limit <= 0) errors.push('Budget limit must be positive');
  if (!body.month || body.month < 1 || body.month > 12) errors.push('Valid month (1-12) is required');
  if (!body.year) errors.push('Year is required');
  return errors;
});
