import prisma from '../../lib/prisma.js';
import { PostStatus } from '../../../../generated/prisma/client/index.js';

const createPost = async (authorId: string, payload: { content?: string; mediaUrls?: string[] }) => {
  const result = await prisma.post.create({
    data: {
      authorId,
      content: payload.content,
      mediaUrls: payload.mediaUrls || [],
    },
    include: { author: true },
  });
  return result;
};

const getAllPosts = async () => {
  const result = await prisma.post.findMany({
    include: { author: true },
    orderBy: { createdAt: 'desc' },
  });
  return result;
};

const updatePostStatus = async (id: string, status: PostStatus) => {
  const result = await prisma.post.update({
    where: { id },
    data: { status },
  });
  return result;
};

const deletePost = async (id: string) => {
  const result = await prisma.post.delete({
    where: { id },
  });
  return result;
};

export const PostServices = {
  createPost,
  getAllPosts,
  updatePostStatus,
  deletePost,
};
