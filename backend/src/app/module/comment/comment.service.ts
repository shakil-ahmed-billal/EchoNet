import prisma from '../../lib/prisma.js';

const createComment = async (authorId: string, postId: string, payload: { content: string; parentId?: string }) => {
  const result = await prisma.comment.create({
    data: {
      authorId,
      postId,
      content: payload.content,
      parentId: payload.parentId,
    },
  });
  return result;
};

const getCommentsForPost = async (postId: string) => {
  const result = await prisma.comment.findMany({
    where: { 
      postId,
      parentId: null // start with top-level comments
    },
    include: { 
      author: true, 
      _count: {
        select: {
          likes: true,
          replies: true,
        }
      },
      replies: {
        include: {
          author: true,
          _count: {
            select: {
              likes: true,
              replies: true,
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
  return result;
};

const deleteComment = async (id: string) => {
  const result = await prisma.comment.delete({
    where: { id },
  });
  return result;
};

export const CommentServices = {
  createComment,
  getCommentsForPost,
  deleteComment,
};
