import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as notificationService from '../services/notificationService.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getNotifications(req.user._id);
  sendSuccess(res, notifications);
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.user._id, req.params.id);
  sendSuccess(res, notification);
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  sendSuccess(res, null, 200, 'All notifications marked as read');
});

export const removeNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.user._id, req.params.id);
  sendSuccess(res, null, 200, 'Notification deleted');
});

export const triggerTestNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.createNotification(req.user._id, {
    type: req.body.type || 'warning',
    title: req.body.title || '🚨 Budget Alert (Test)',
    description: req.body.description || 'This is a test notification to verify your email and in-app system is working correctly.'
  });
  sendSuccess(res, notification, 201, 'Test notification triggered successfully');
});
