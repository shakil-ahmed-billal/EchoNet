import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { StoreServices } from './store.service.js';

const createStore = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await StoreServices.createStore(userId, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Store created successfully',
    data: result,
  });
});

const getStoreById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const currentUserId = (req as any).user?.id;
  const result = await StoreServices.getStoreById(id, currentUserId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Store fetched successfully',
    data: result,
  });
});

const getMyStore = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await StoreServices.getMyStore(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My store fetched successfully',
    data: result,
  });
});

const updateStore = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params as { id: string };
  const result = await StoreServices.updateStore(userId, id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Store updated successfully',
    data: result,
  });
});

const toggleFollowStore = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id: storeId } = req.params as { id: string };
  const result = await StoreServices.toggleFollowStore(userId, storeId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.followed ? 'Followed store' : 'Unfollowed store',
    data: result,
  });
});

export const StoreControllers = {
  createStore,
  getStoreById,
  getMyStore,
  updateStore,
  toggleFollowStore,
};
