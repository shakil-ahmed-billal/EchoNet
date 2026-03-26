import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { FollowServices } from './follow.service.js';

const followUser = catchAsync(async (req: Request, res: Response) => {
    const followerId = (req as any).user.id;
    const { followingId } = req.body;
    const result = await FollowServices.followUser(followerId, followingId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Followed successfully',
        data: result,
    });
});

const unfollowUser = catchAsync(async (req: Request, res: Response) => {
    const followerId = (req as any).user.id;
    const { followingId } = req.body;
    const result = await FollowServices.unfollowUser(followerId, followingId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Request deleted/unfollowed successfully',
        data: result,
    });
});

const acceptFollow = catchAsync(async (req: Request, res: Response) => {
    const receiverId = (req as any).user.id;
    const { senderId } = req.body;
    const result = await FollowServices.acceptFollow(receiverId, senderId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Friend request accepted',
        data: result,
    });
});

const getFollowers = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await FollowServices.getFollowers(userId); // wait, getFollowers service needs update if I want to support it there
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Followers retrieved successfully',
        data: result,
    });
});

const getFollowing = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await FollowServices.getFollowing(userId, page, limit);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Following list retrieved successfully',
        data: result,
    });
});

const getPendingRequests = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    console.log(`[DEBUG] Fetching pending requests for user: ${userId}`);
    const result = await FollowServices.getPendingRequests(userId, page, limit);
    console.log(`[DEBUG] Found ${result.length} pending requests`);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Pending requests retrieved successfully',
        data: result,
    });
});

const getSuggestions = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const result = await FollowServices.getSuggestions(userId, page, limit);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Suggestions retrieved successfully',
        data: result,
    });
});

export const FollowControllers = {
    followUser,
    acceptFollow,
    unfollowUser,
    getFollowers,
    getFollowing,
    getPendingRequests,
    getSuggestions,
};
