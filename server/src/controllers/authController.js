import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import * as authService from '../services/authService.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  sendCreated(res, result, 'Account created successfully');
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  sendSuccess(res, result, 200, 'Login successful');
});

export const googleLogin = asyncHandler(async (req, res) => {
  const result = await authService.googleLogin(req.body.token);
  sendSuccess(res, result, 200, 'Google login successful');
});

export const getMe = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user._id);
  sendSuccess(res, profile);
});
