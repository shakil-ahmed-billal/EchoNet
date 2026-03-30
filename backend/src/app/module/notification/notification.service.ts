import { NotificationType } from '../../../../generated/prisma/client/index.js';
import prisma from '../../lib/prisma.js';
import redisClient from '../../lib/redis.js';
import { getIO } from '../../lib/socket.js';

const MAX_NOTIFICATIONS_PER_USER = 5;

const createNotification = async (data: {
  userId: string;
  type: string;
  referenceId?: string;
  message: string;
}) => {
  const result = await prisma.notification.create({
    data: data as any, 
  });

  // Auto-delete oldest notifications beyond the limit
  const allNotifications = await prisma.notification.findMany({
    where: { userId: data.userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });

  if (allNotifications.length > MAX_NOTIFICATIONS_PER_USER) {
    const toDelete = allNotifications.slice(MAX_NOTIFICATIONS_PER_USER).map((n) => n.id);
    await prisma.notification.deleteMany({ where: { id: { in: toDelete } } });
  }

  if (redisClient) {
    const cacheKey = `notifications:unread_count:${data.userId}`;
    await redisClient.del(cacheKey);
  }

  try {
    const io = getIO();
    io.to(data.userId).emit('new-notification', result); // matches frontend socket-handler listener
  } catch (error) {
    // Socket might not be initialized yet in some cases, fail gracefully
  }

  return result;
};

const getUserNotifications = async (userId: string) => {
  if (!userId) return [];
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // Enrich with sender info where referenceId is a userId (FOLLOW, FOLLOW_REQUEST, FRIEND_ACCEPT, REACTION, COMMENT)
  const enriched = await Promise.all(
    notifications.map(async (notif) => {
      if (!notif.referenceId) return { ...notif, sender: null };
      try {
        const sender = await prisma.user.findUnique({
          where: { id: notif.referenceId },
          select: { id: true, name: true, avatarUrl: true, image: true },
        });
        return { ...notif, sender: sender || null };
      } catch {
        return { ...notif, sender: null };
      }
    })
  );

  return enriched;
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
