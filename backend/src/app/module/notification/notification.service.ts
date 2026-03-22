import prisma from '../../lib/prisma.js';

const getUserNotifications = async (userId: string) => {
  const result = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return result;
};

const markAsRead = async (id: string) => {
  const result = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
  return result;
};

export const NotificationServices = {
  getUserNotifications,
  markAsRead,
};
