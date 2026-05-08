import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as analyticsService from '../services/analyticsService.js';

export const getOverview = asyncHandler(async (req, res) => {
  const overview = await analyticsService.getAnalyticsOverview(req.user._id);
  sendSuccess(res, overview);
});

export const getInsights = asyncHandler(async (req, res) => {
  const insights = await analyticsService.getInsights(req.user._id);
  sendSuccess(res, insights);
});
