import prisma from '../../lib/prisma.js';

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

export const MessageServices = {
  getChatHistory,
};
