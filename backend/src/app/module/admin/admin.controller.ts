import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { AdminServices } from './admin.service.js';

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getDashboardStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard stats retrieved successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllUsers(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllPosts(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Posts fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllStories = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllStories(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stories fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllProducts(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Products fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllProperties(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Properties fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { role } = req.body;
  const result = await AdminServices.updateUserRole(id, role);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User role updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await AdminServices.deleteUser(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User and all associated data deleted',
    data: result,
  });
});

const deleteStory = catchAsync(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await AdminServices.deleteStory(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Story deleted',
    data: result,
  });
});

export const AdminControllers = {
  getDashboardStats,
  getAllUsers,
  getAllPosts,
  getAllStories,
  getAllProducts,
  getAllProperties,
  updateUserRole,
  deleteUser,
  deleteStory,
};
