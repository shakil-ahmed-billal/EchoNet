import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { MessageServices } from './message.service.js';
import { getIO } from '../../lib/socket.js';

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const senderId = (req.user as any).id;
  const { receiverId, content } = req.body;

  const result = await MessageServices.createMessage({
    senderId,
    receiverId,
    content,
  });
  
  try {
    const io = getIO();
    io.to(receiverId).emit('new-message', {
       senderId,
       receiverId,
       content,
       createdAt: result.createdAt,
       isRead: result.isRead,
       id: result.id,
       senderName: (req.user as any).name || 'Someone',
    });
  } catch (err) {
    console.error("Socket error on sendMessage:", err);
  }

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Message sent successfully',
    data: result,
  });
});

const getChatHistory = catchAsync(async (req: Request, res: Response) => {
  const otherUserId = req.params.otherUserId as string;
  const userId = (req.user as any).id;

  const result = await MessageServices.getChatHistory(userId, otherUserId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chat history retrieved successfully',
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const senderId = req.params.senderId as string;
  const receiverId = (req.user as any).id;
  
  const result = await MessageServices.markAsRead(senderId, receiverId);

  // Ensure socket initialized
  try {
    const io = getIO();
    io.to(senderId).emit('messages-read', { by: receiverId });
  } catch (e) {
    console.error("Socket error on markAsRead:", e);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Messages marked as read successfully',
    data: result,
  });
});

export const MessageControllers = {
  getChatHistory,
  sendMessage,
  markAsRead,
};
