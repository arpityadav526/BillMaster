import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/mailer.js';

export const createNotification = async (userId, data) => {
  const notification = await Notification.create({ ...data, user: userId });
  
  // 1. In-App: Handled by polling/fetching from client (or Socket.io if implemented)
  
  // 2. Email Notification for high severity alerts
  if (data.type === 'warning' || data.type === 'alert') {
    try {
      const user = await User.findById(userId);
      if (user && user.email) {
        await sendEmail(
          user.email,
          `BillMaster: ${data.title}`,
          data.description,
          `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #10b981;">BillMaster Alert</h2>
            <h3 style="color: #1e293b;">${data.title}</h3>
            <p style="color: #475569; line-height: 1.6;">${data.description}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #94a3b8;">This is an automated notification from your BillMaster account.</p>
          </div>`
        );
      }
    } catch (error) {
      console.error('Failed to send notification email:', error);
    }
  }
  
  // 3. Mobile Push Placeholder (Future FCM/OneSignal integration)
  // if (user.fcmToken) {
  //   sendPushNotification(user.fcmToken, data.title, data.description);
  // }
  
  return notification;
};

export const getNotifications = async (userId) => {
  return await Notification.find({ user: userId }).sort({ createdAt: -1 });
};

export const markAsRead = async (userId, notificationId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  return await Notification.updateMany({ user: userId, read: false }, { read: true });
};

export const deleteNotification = async (userId, notificationId) => {
  return await Notification.findOneAndDelete({ _id: notificationId, user: userId });
};
