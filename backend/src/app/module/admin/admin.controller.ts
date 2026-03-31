import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { AdminServices } from './admin.service.js';
import { clearCache } from '../../utils/redisCache.js';

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
  await clearCache('users');
  await clearCache('admin_stats');
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
  await clearCache('users');
  await clearCache('admin_stats');
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
  await clearCache('stories');
  await clearCache('admin_stats');
});

const updatePostStatus = catchAsync(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status } = req.body;
  const result = await AdminServices.updatePostStatus(id, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post status updated',
    data: result,
  });
  await clearCache('posts');
  await clearCache('admin_stats');
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await AdminServices.deletePost(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post deleted',
    data: result,
  });
  await clearCache('posts');
  await clearCache('admin_stats');
});

const updateProductStatus = catchAsync(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status } = req.body;
  const result = await AdminServices.updateProductStatus(id, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product status updated',
    data: result,
  });
  await clearCache('products');
  await clearCache('admin_stats');
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await AdminServices.deleteProduct(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product deleted',
    data: result,
  });
  await clearCache('products');
  await clearCache('admin_stats');
});

const updatePropertyStatus = catchAsync(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status } = req.body;
  const result = await AdminServices.updatePropertyStatus(id, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property status updated',
    data: result,
  });
  await clearCache('properties');
  await clearCache('admin_stats');
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await AdminServices.deleteProperty(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property deleted',
    data: result,
  });
  await clearCache('properties');
  await clearCache('admin_stats');
});

const verifyAgent = catchAsync(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await AdminServices.verifyAgent(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Agent verified',
    data: result,
  });
  await clearCache('users');
  await clearCache('admin_stats');
});

const rejectAgent = catchAsync(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await AdminServices.rejectAgent(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Agent rejected',
    data: result,
  });
  await clearCache('users');
  await clearCache('admin_stats');
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
  updatePostStatus,
  deletePost,
  updateProductStatus,
  deleteProduct,
  updatePropertyStatus,
  deleteProperty,
  verifyAgent,
  rejectAgent,
};
