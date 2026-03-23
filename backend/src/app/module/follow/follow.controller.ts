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
    const result = await FollowServices.getFollowers(userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Followers retrieved successfully',
        data: result,
    });
});

const getFollowing = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const result = await FollowServices.getFollowing(userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Following list retrieved successfully',
        data: result,
    });
});

export const FollowControllers = {
    followUser,
    acceptFollow,
    unfollowUser,
    getFollowers,
    getFollowing,
};
