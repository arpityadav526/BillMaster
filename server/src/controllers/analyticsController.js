import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as analyticsService from '../services/analyticsService.js';

export const getOverview = asyncHandler(async (req, res) => {
  const overview = await analyticsService.getAnalyticsOverview(req.user._id);
  sendSuccess(res, overview);
});

export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await analyticsService.getAnalyticsDashboard(req.user._id);
  sendSuccess(res, dashboard);
});

export const getInsights = asyncHandler(async (req, res) => {
  const insights = await analyticsService.getInsights(req.user._id);
  sendSuccess(res, insights);
});

export const getSavingsPrediction = asyncHandler(async (req, res) => {
  const prediction = await analyticsService.getSavingsPrediction(req.user._id);
  sendSuccess(res, prediction);
});

export const postChat = asyncHandler(async (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Question is required.' });
  }
  const answer = await analyticsService.getChatResponse(req.user._id, question.trim());
  sendSuccess(res, { answer });
});
