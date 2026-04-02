import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { ProductReviewServices } from './product.review.service.js';

const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id: productId } = req.params as { id: string };
  const result = await ProductReviewServices.createReview(userId, productId, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

const likeReview = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id: reviewId } = req.params as { id: string };
  const result = await ProductReviewServices.likeReview(userId, reviewId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.liked ? 'Review liked' : 'Review unliked',
    data: result,
  });
});

const createReply = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id: reviewId } = req.params as { id: string };
  const result = await ProductReviewServices.createReply(userId, reviewId, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Reply created successfully',
    data: result,
  });
});

export const ProductReviewControllers = {
  createReview,
  likeReview,
  createReply,
};
