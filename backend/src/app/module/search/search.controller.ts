import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { SearchServices } from './search.service.js';

const globalSearch = catchAsync(async (req: Request, res: Response) => {
    const { q, type, limit } = req.query;
    const searchTerm = q as string;
    const searchType = (type as 'users' | 'posts' | 'tags') || 'users';
    const searchLimit = limit ? parseInt(limit as string) : 20;

    const result = await SearchServices.globalSearch(searchTerm, searchType, searchLimit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Search results fetched successfully',
        data: result,
    });
});

export const SearchControllers = {
    globalSearch
};
