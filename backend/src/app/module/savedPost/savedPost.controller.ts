import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { SavedPostServices } from './savedPost.service.js';

const savePost = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const postId = req.params.postId as string;

    const result = await SavedPostServices.savePost(userId, postId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post saved successfully',
        data: result,
    });
});

const unsavePost = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const postId = req.params.postId as string;

    const result = await SavedPostServices.unsavePost(userId, postId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Post unsaved successfully',
        data: result,
    });
});

const getSavedPosts = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { limit, cursor } = req.query;
    const savedLimit = limit ? parseInt(limit as string) : 20;

    const result = await SavedPostServices.getSavedPosts(userId, savedLimit, cursor as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Saved posts fetched successfully',
        data: result,
    });
});

export const SavedPostControllers = {
    savePost,
    unsavePost,
    getSavedPosts
};
