import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { EnquiryServices } from './enquiry.service.js';

const sendEnquiry = catchAsync(async (req: Request, res: Response) => {
  const senderId = (req as any).user.id;
  const result = await EnquiryServices.sendEnquiry(senderId, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Enquiry sent successfully',
    data: result,
  });
});

const getMyEnquiries = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await EnquiryServices.getMyEnquiries(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My enquiries fetched successfully',
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params as { id: string };
  const result = await EnquiryServices.markAsRead(id, userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Enquiry marked as read successfully',
    data: result,
  });
});

export const EnquiryControllers = {
  sendEnquiry,
  getMyEnquiries,
  markAsRead,
};
