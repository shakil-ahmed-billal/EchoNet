import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { SettingServices } from './setting.service.js';
import httpStatus from 'http-status';

const getStoryDuration = catchAsync(async (req: Request, res: Response) => {
  const duration = await SettingServices.getSetting('story_duration');
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Story duration retrieved successfully',
    data: duration || '2', // Default to 2 days
  });
});

const updateStoryDuration = catchAsync(async (req: Request, res: Response) => {
  const { duration } = req.body;
  const result = await SettingServices.updateSetting('story_duration', String(duration));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Story duration updated successfully',
    data: result,
  });
});

export const SettingControllers = {
  getStoryDuration,
  updateStoryDuration,
};
