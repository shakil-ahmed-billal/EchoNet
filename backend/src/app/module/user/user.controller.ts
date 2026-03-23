import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import ApiError from '../../errorHelpers/ApiError.js';
import { UserServices } from './user.service.js';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = (req as any).user?.id;
  const result = await UserServices.getAllUsers(req.query, currentUserId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const currentUserId = (req as any).user?.id;
  const result = await UserServices.getUserById(id, currentUserId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const loggedInUserId = (req as any).user.id;
  const role = (req as any).user.role;

  if (loggedInUserId !== id && role !== 'ADMIN') {
     throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to edit this profile');
  }

  const result = await UserServices.updateUser(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const suspendUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await UserServices.suspendUser(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User suspended successfully',
    data: result,
  });
});

export const UserControllers = {
  getAllUsers,
  getUserById,
  updateUser,
  suspendUser,
};
