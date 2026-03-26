import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { GroupService } from './group.service.js';

const createGroup = catchAsync(async (req: Request, res: Response) => {
    const currentUserId = req.user?.id;
    const { name, memberIds } = req.body;
    const result = await GroupService.createGroup({ name, memberIds, createdBy: currentUserId! });
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Group created successfully',
        data: result
    });
});

const getUserGroups = catchAsync(async (req: Request, res: Response) => {
    const currentUserId = req.user?.id;
    const result = await GroupService.getUserGroups(currentUserId!);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Groups retrieved successfully',
        data: result
    });
});

export const GroupController = { createGroup, getUserGroups };
