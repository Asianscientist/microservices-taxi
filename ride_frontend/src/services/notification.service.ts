import api from './api';

class NotificationService {
  /**
   * Get all notifications
   */
  async getNotifications() {
    const response = await api.get('/notifications/');
    return response.data;
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications() {
    const response = await api.get('/notifications/unread/');
    return response.data;
  }

  /**
   * Get notification statistics
   */
  async getStats() {
    const response = await api.get('/notifications/stats/');
    return response.data;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number) {
    const response = await api.post(`/notifications/${notificationId}/read/`);
    return response.data;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const response = await api.post('/notifications/mark-all-read/');
    return response.data;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: number) {
    const response = await api.delete(`/notifications/${notificationId}/`);
    return response.data;
  }

  /**
   * Get notification preferences
   */
  async getPreferences() {
    const response = await api.get('/notifications/preferences/');
    return response.data;
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(data: any) {
    const response = await api.patch('/notifications/preferences/', data);
    return response.data;
  }
}

export default new NotificationService();
