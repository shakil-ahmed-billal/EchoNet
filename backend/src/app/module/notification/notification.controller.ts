import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { NotificationServices } from './notification.service.js';

const getUserNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || (req.query as any).userId;
  const result = await NotificationServices.getUserNotifications(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notifications retrieved successfully',
    data: result,
  });
});

const getUnreadCount = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || (req.query as any).userId;
  const result = await NotificationServices.getUnreadCount(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Unread count retrieved successfully',
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = (req as any).user?.id || (req.body as any).userId;
  const result = await NotificationServices.markAsRead(id, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification marked as read',
    data: result,
  });
});

export const NotificationControllers = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
};
