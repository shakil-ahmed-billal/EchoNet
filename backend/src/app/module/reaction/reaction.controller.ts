import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { ReactionServices } from './reaction.service.js';

const toggleReaction = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const result = await ReactionServices.toggleReaction(userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reaction toggled successfully',
        data: result,
    });
});

export const ReactionControllers = {
    toggleReaction,
};
