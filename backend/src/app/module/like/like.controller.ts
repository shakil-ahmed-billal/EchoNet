import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { LikeServices } from './like.service.js';

const toggleLike = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || req.body.userId; 
  const result = await LikeServices.toggleLike(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.liked ? 'Liked successfully' : 'Unliked successfully',
    data: result,
  });
});

export const LikeControllers = {
  toggleLike,
};
