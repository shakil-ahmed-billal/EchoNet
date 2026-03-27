import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { PropertyServices } from './property.service.js';
import { uploadMedia, deleteMedia } from '../../lib/cloudinary.js';
import fs from 'fs';

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  // Parse data from multipart
  const payload = (typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body) || {};
  const files = req.files as Express.Multer.File[];
  
  const uploadedImages: { url: string; publicId: string }[] = [];

  try {
    // 1. Upload to Cloudinary
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await uploadMedia(file.path, 'properties');
        uploadedImages.push({ url: result.url, publicId: result.public_id });
        // Clean up local temp file
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    // 2. Add uploaded URLs to payload
    if (uploadedImages.length > 0) {
      const newImages = uploadedImages.map((img, index) => ({
        url: img.url,
        isCover: (payload.images || []).length === 0 && index === 0, 
        publicId: img.publicId
      }));
      payload.images = [...(payload.images || []), ...newImages];
    }

    // 3. Create Property
    const result = await PropertyServices.createProperty(userId, payload);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Property created successfully',
      data: result,
    });
  } catch (error) {
    // FAIL-SAFE: Cleanup Cloudinary if creation fails
    for (const img of uploadedImages) {
      await deleteMedia(img.publicId);
    }
    // Cleanup any remaining local files
    if (files) {
      for (const file of files) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }
    throw error;
  }
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
  
  // Parse data from multipart
  const payload = (typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body) || {};
  const files = req.files as Express.Multer.File[];
  
  const uploadedImages: { url: string; publicId: string }[] = [];

  try {
    // 1. Upload new files if any
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await uploadMedia(file.path, 'properties');
        uploadedImages.push({ url: result.url, publicId: result.public_id });
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    // 2. Handle Image Merging
    if (uploadedImages.length > 0) {
      const newImages = uploadedImages.map((img) => ({
        url: img.url,
        isCover: false, 
        publicId: img.publicId
      }));
      payload.images = [...(payload.images || []), ...newImages];
    }

    const result = await PropertyServices.updateProperty(id, userId, payload);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Property updated successfully',
      data: result,
    });
  } catch (error) {
    // FAIL-SAFE: Cleanup Cloudinary
    for (const img of uploadedImages) {
      await deleteMedia(img.publicId);
    }
    if (files) {
      for (const file of files) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }
    throw error;
  }
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
  const result = await PropertyServices.getMyProperties(userId, req.query);
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
