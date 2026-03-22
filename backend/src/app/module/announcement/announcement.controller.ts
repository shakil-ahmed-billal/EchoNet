import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { AnnouncementServices } from './announcement.service.js';

const createAnnouncement = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req as any).user?.id || req.body.adminId;
  const result = await AnnouncementServices.createAnnouncement(adminId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Announcement created successfully',
    data: result,
  });
});

const getAnnouncements = catchAsync(async (req: Request, res: Response) => {
  const result = await AnnouncementServices.getAnnouncements();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Announcements retrieved successfully',
    data: result,
  });
});

export const AnnouncementControllers = {
  createAnnouncement,
  getAnnouncements,
};
