import prisma from '../../lib/prisma.js';
import redisClient from '../../lib/redis.js';

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
  getUserNotifications,
  getUnreadCount,
  markAsRead,
};
