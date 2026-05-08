import Notification from '../models/Notification.js';

export const createNotification = async (userId, data) => {
  const notification = await Notification.create({ ...data, user: userId });
  
  // Simulate Email Dispatch for high severity alerts
  if (data.type === 'warning' || data.type === 'alert') {
    console.log(`\n[EMAIL SIMULATION] Sending high-priority alert to User ${userId}`);
    console.log(`Subject: 🚨 BillMaster Alert: ${data.title}`);
    console.log(`Body: ${data.description}\n`);
  }
  
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
