import prisma from '../../lib/prisma.js';
import { getIO } from '../../lib/socket.js';

const createMessage = async (payload: { senderId: string; receiverId?: string; groupId?: string; content: string }) => {
  const result = await prisma.message.create({
    data: payload,
  });

  try {
    const io = getIO();
    const targetRoom = payload.groupId ? `group_${payload.groupId}` : payload.receiverId!;
    io.to(targetRoom).emit('new-message', result);
  } catch(error) {
    console.error("Failed to emit new message:", error);
  }

  return result;
};

const getChatHistory = async (userId1: string, otherId: string, isGroup: boolean) => {
  if (isGroup) {
      return prisma.message.findMany({
        where: { groupId: otherId },
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { name: true, image: true, id: true } } }
      });
  }

  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId1, receiverId: otherId },
        { senderId: otherId, receiverId: userId1 },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });
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

const getConversations = async (userId: string) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
      groupId: null, // Basic 1:1 conversations for now
    },
    orderBy: { createdAt: 'desc' },
  });

  const conversations: Record<string, any> = {};

  messages.forEach((msg) => {
    const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!otherId) return;

    if (!conversations[otherId]) {
      conversations[otherId] = {
        userId: otherId,
        lastMessage: msg.content,
        lastMessageTime: msg.createdAt,
        unreadCount: 0,
      };
    }

    if (msg.receiverId === userId && !msg.isRead) {
      conversations[otherId].unreadCount++;
    }
  });

  return Object.values(conversations);
};

export const MessageServices = {
  getChatHistory,
  createMessage,
  markAsRead,
  getConversations,
};
