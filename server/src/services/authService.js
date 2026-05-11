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
    monthlySalary: user.monthlySalary,
    targetSavingsAmount: user.targetSavingsAmount,
    customCategories: user.customCategories,
    preferences: user.preferences,
    avatar: user.avatar,
    timezone: user.timezone,
    createdAt: user.createdAt,
  },
});

export const registerUser = async (userData) => {
  const { name, email, password } = userData;
  // Check if user exists
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const user = await User.create(userData);
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

export const googleLogin = async (idToken) => {
  // In a real app, use google-auth-library to verify the token:
  // const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
  // const payload = ticket.getPayload();
  
  // For now, we simulate the verification and use placeholder data
  // or data sent from frontend (Note: NEVER trust frontend data in prod!)
  // Assuming the 'token' passed is actually a mock user data for this assignment
  let userData;
  try {
    userData = JSON.parse(idToken);
  } catch {
    // Fallback if not a JSON string
    userData = { email: 'google.user@example.com', name: 'Google User', picture: null };
  }

  let user = await User.findOne({ email: userData.email });

  if (!user) {
    // Create new user if doesn't exist
    user = await User.create({
      name: userData.name,
      email: userData.email,
      password: Math.random().toString(36).slice(-10), // Random password
      avatar: userData.picture,
    });
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
    monthlySalary: user.monthlySalary,
    targetSavingsAmount: user.targetSavingsAmount,
    customCategories: user.customCategories,
    preferences: user.preferences,
    avatar: user.avatar,
    timezone: user.timezone,
    createdAt: user.createdAt,
  };
};
