import { apiClient } from "./api-client";

export interface Notification {
  id: string;
  userId: string;
  type: 'LIKE' | 'COMMENT' | 'MESSAGE' | 'ANNOUNCEMENT' | 'CALL' | 'FRIEND_REQUEST' | 'FRIEND_ACCEPT';
  referenceId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const getNotifications = async () => {
  const response = await apiClient.get('/notifications');
  return response.data?.data ?? [] as Notification[];
};

export const getUnreadCount = async () => {
  const response = await apiClient.get('/notifications/unread-count');
  return response.data?.data ?? 0;
};

export const markAsRead = async (id: string) => {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response.data.data;
};
