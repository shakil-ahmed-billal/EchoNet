import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { CommentServices } from './comment.service.js';

const createComment = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user?.id as string; // Assuming authenticate middleware sets req.user
  const postId = req.params.postId as string;
  const result = await CommentServices.createComment(authorId, postId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Comment created successfully',
    data: result,
  });
});

const getCommentsForPost = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.postId as string;
  const result = await CommentServices.getCommentsForPost(postId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comments retrieved successfully',
    data: result,
  });
});

const getUserComments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const result = await CommentServices.getCommentsByUser(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User comments retrieved successfully',
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await CommentServices.deleteComment(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment deleted successfully',
    data: result,
  });
});

export const CommentControllers = {
  createComment,
  getCommentsForPost,
  getUserComments,
  deleteComment,
};
