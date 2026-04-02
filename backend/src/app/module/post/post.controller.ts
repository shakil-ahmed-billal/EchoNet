import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import { PostServices } from './post.service.js';
import { Role } from '../../../../generated/prisma/client/index.js';
import { clearCache } from '../../utils/redisCache.js';

const createPost = catchAsync(async (req: Request, res: Response) => {
  const authorId = (req as any).user?.id;
  const result = await PostServices.createPost(authorId, req.body, req.files as any);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Post created successfully',
    data: result,
  });
  await clearCache('posts');
});


const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const cursor = req.query.cursor as string | undefined;
  const userId = (req as any).user?.id;
  const discover = req.query.discover === 'true';
  const authorId = req.query.authorId as string | undefined;
  const status = req.query.status as string | undefined;

  // Handle admin moderation requests for flagged posts
  if (status === 'FLAGGED') {
    const flaggedPosts = await PostServices.getFlaggedPosts(req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Flagged posts retrieved successfully',
      data: flaggedPosts,
    });
    return;
  }

  const result = await PostServices.getAllPosts(
    limit, 
    cursor, 
    userId, 
    discover, 
    authorId, 
    req.query.mediaOnly === 'true'
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Posts retrieved successfully',
    data: result,
  });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = (req as any).user?.id;
  const result = await PostServices.getPostById(id, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post retrieved successfully',
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
  await clearCache('posts');
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const authorId = (req as any).user?.id;
  const result = await PostServices.updatePost(id, authorId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post updated successfully',
    data: result,
  });
  await clearCache('posts');
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const authorId = (req as any).user?.id;
  const isAdmin = (req as any).user?.role === Role.ADMIN;
  const result = await PostServices.deletePost(id, authorId, isAdmin);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post deleted successfully',
    data: result,
  });
  await clearCache('posts');
});

export const PostControllers = {
  createPost,
  getAllPosts,
  getPostById,
  updatePostStatus,
  updatePost,
  deletePost,
};

