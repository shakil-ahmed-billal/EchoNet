import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { MessageServices } from './message.service.js';

const getChatHistory = catchAsync(async (req: Request, res: Response) => {
  const otherUserId = req.params.otherUserId as string;
  const userId = (req.query.userId || req.user?.id) as string;

  const result = await MessageServices.getChatHistory(userId, otherUserId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chat history retrieved successfully',
    data: result,
  });
});

export const MessageControllers = {
  getChatHistory,
};
