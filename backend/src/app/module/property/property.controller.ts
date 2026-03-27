import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { PropertyServices } from './property.service.js';

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await PropertyServices.createProperty(userId, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Property created successfully',
    data: result,
  });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyServices.getAllProperties(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Properties fetched successfully',
    data: result,
  });
});

const getPropertyById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await PropertyServices.getPropertyById(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Property fetched successfully',
    data: result,
  });
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params as { id: string };
  const result = await PropertyServices.updateProperty(id, userId, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Property updated successfully',
    data: result,
  });
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params as { id: string };
  const result = await PropertyServices.deleteProperty(id, userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Property deleted successfully',
    data: result,
  });
});

const getMyProperties = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await PropertyServices.getMyProperties(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My properties fetched successfully',
    data: result,
  });
});

const approveProperty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await PropertyServices.updateStatus(id, 'ACTIVE');
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Property approved successfully',
    data: result,
  });
});

const rejectProperty = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await PropertyServices.updateStatus(id, 'REJECTED');
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Property rejected successfully',
    data: result,
  });
});

export const PropertyControllers = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getMyProperties,
  approveProperty,
  rejectProperty,
};
