import User from '../models/User.js';
import AppError from '../utils/AppError.js';

export const updateProfile = async (userId, data) => {
  const allowedUpdates = ['name', 'currency', 'monthlyIncome', 'monthlyIncomeTarget', 'financialGoal', 'avatar', 'theme', 'timezone'];
  const updates = {};
  
  Object.keys(data).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = data[key];
    }
  });

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true
  });

  if (!user) throw new AppError('User not found', 404);
  
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    currency: user.currency,
    monthlyIncome: user.monthlyIncome,
    monthlyIncomeTarget: user.monthlyIncomeTarget,
    financialGoal: user.financialGoal,
    avatar: user.avatar,
    theme: user.theme,
    timezone: user.timezone,
    createdAt: user.createdAt
  };
};

export const updatePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw new AppError('Current password incorrect', 401);

  user.password = newPassword;
  await user.save();
  
  return true;
};
