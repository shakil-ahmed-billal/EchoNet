import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { PostServices } from './post.service.js';

const createPost = catchAsync(async (req: Request, res: Response) => {
  // Assuming auth middleware attaches user to req.user
  const authorId = (req as any).user?.id || req.body.authorId; 
  const result = await PostServices.createPost(authorId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Post created successfully',
    data: result,
  });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.getAllPosts();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Posts retrieved successfully',
    data: result,
  });
});

const updatePostStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body;
  const result = await PostServices.updatePostStatus(id, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post status updated successfully',
    data: result,
  });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await PostServices.deletePost(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post deleted successfully',
    data: result,
  });
});

export const PostControllers = {
  createPost,
  getAllPosts,
  updatePostStatus,
  deletePost,
};
