import api from './api';

export const getNotifications = async () => {
  return await api.get('/notifications');
};

export const markRead = async (id) => {
  return await api.patch(`/notifications/${id}/read`);
};

export const markAllRead = async () => {
  return await api.patch('/notifications/read-all');
};

export const deleteNotification = async (id) => {
  return await api.delete(`/notifications/${id}`);
};
