import { NotificationType } from '../../../../generated/prisma/client/index.js';
import prisma from '../../lib/prisma.js';
import redisClient from '../../lib/redis.js';
import { getIO } from '../../lib/socket.js';

const createNotification = async (data: {
  userId: string;
  type: string;
  referenceId?: string;
  message: string;
}) => {
  const result = await prisma.notification.create({
    data: data as any, 
  });

  if (redisClient) {
    const cacheKey = `notifications:unread_count:${data.userId}`;
    await redisClient.del(cacheKey);
  }

  try {
    const io = getIO();
    io.to(data.userId).emit('notification', result);
  } catch (error) {
    // Socket might not be initialized yet in some cases, fail gracefully
  }

  return result;
};

const getUserNotifications = async (userId: string) => {
  if (!userId) return [];
  const result = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return result;
};

const getUnreadCount = async (userId: string) => {
  if (!userId) return 0;
  const cacheKey = `notifications:unread_count:${userId}`;
  
  if (redisClient) {
    const cachedCount = await redisClient.get(cacheKey);
    if (cachedCount !== null) {
      return parseInt(cachedCount);
    }
  }

  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  if (redisClient) {
    await redisClient.setEx(cacheKey, 3600, count.toString()); // Cache for 1 hour
  }
  return count;
};

const markAsRead = async (id: string, userId: string) => {
  if (!id || !userId) return null;
  const result = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  if (redisClient) {
    // Invalidate cache
    const cacheKey = `notifications:unread_count:${userId}`;
    await redisClient.del(cacheKey);
  }

  return result;
};

export const NotificationServices = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
};
