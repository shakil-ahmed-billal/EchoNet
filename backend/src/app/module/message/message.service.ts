import prisma from '../../lib/prisma.js';

const createMessage = async (payload: { senderId: string; receiverId: string; content: string }) => {
  const result = await prisma.message.create({
    data: payload,
  });
  return result;
};

const getChatHistory = async (userId1: string, userId2: string) => {
  const result = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });
  return result;
};

const markAsRead = async (senderId: string, receiverId: string) => {
  const result = await prisma.message.updateMany({
    where: {
      senderId,
      receiverId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
  return result;
};

export const MessageServices = {
  getChatHistory,
  createMessage,
  markAsRead,
};
