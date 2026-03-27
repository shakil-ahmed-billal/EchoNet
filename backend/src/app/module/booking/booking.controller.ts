import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { BookingServices } from './booking.service.js';

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await BookingServices.createBooking(userId, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Booking created successfully',
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const role = (req as any).user.role;
  const result = await BookingServices.getMyBookings(userId, role);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My bookings fetched successfully',
    data: result,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params as { id: string };
  const { status } = req.body;
  const result = await BookingServices.updateBookingStatus(id, userId, status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Booking status updated successfully',
    data: result,
  });
});

export const BookingControllers = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
};
