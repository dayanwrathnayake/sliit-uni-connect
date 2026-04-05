import api from './axios';

export const getNotifications = ({ page = 0, size = 15 } = {}) =>
  api.get('/api/notifications', { params: { page, size } });

export const getUnreadCount = () =>
  api.get('/api/notifications/unread-count');

export const markAsRead = (notificationId) =>
  api.put(`/api/notifications/${notificationId}/read`);

export const markAllAsRead = () =>
  api.put('/api/notifications/read-all');
