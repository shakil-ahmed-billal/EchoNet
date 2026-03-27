import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { OrderServices } from './order.service.js';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await OrderServices.createOrder(userId, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Order created successfully',
    data: result,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await OrderServices.getMyOrders(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Orders fetched successfully',
    data: result,
  });
});

const getStoreOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await OrderServices.getStoreOrders(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Store orders fetched successfully',
    data: result,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const role = (req as any).user.role;
  const { id } = req.params as { id: string };
  const result = await OrderServices.getOrderById(id, userId, role);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order fetched successfully',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params as { id: string };
  const { status } = req.body;
  const result = await OrderServices.updateOrderStatus(userId, id, status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order status updated successfully',
    data: result,
  });
});

export const OrderControllers = {
  createOrder,
  getMyOrders,
  getStoreOrders,
  getOrderById,
  updateOrderStatus,
};
