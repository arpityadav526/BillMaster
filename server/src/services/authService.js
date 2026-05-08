import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

/**
 * Generates a signed JWT for a user.
 */
const signToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Format user response — strips sensitive fields.
 */
const formatUser = (user, token) => ({
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    currency: user.currency,
    monthlyIncome: user.monthlyIncome,
    createdAt: user.createdAt,
  },
});

export const registerUser = async ({ name, email, password }) => {
  // Check if user exists
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);

  return formatUser(user, token);
};

export const loginUser = async ({ email, password }) => {
  // Find user and explicitly select password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user._id);
  return formatUser(user, token);
};

export const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    currency: user.currency,
    monthlyIncome: user.monthlyIncome,
    createdAt: user.createdAt,
  };
};
