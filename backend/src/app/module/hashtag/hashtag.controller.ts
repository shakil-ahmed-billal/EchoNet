import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { HashtagServices } from './hashtag.service.js';

const getTrendingHashtags = catchAsync(async (req: Request, res: Response) => {
    const { limit } = req.query;
    const trendingLimit = limit ? parseInt(limit as string) : 10;

    const result = await HashtagServices.getTrendingHashtags(trendingLimit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Trending hashtags fetched successfully',
        data: result,
    });
});

export const HashtagControllers = {
    getTrendingHashtags
};
