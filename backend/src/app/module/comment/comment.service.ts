import prisma from '../../lib/prisma.js';
import { NotificationServices } from '../notification/notification.service.js';
import { NotificationType } from '../../../../generated/prisma/client/index.js';

const createComment = async (authorId: string, postId: string, payload: { content: string; parentId?: string }) => {
  const result = await prisma.comment.create({
    data: {
      authorId,
      postId,
      content: payload.content,
      parentId: payload.parentId,
    },
    include: {
      author: { select: { name: true } },
      post: { select: { authorId: true } }
    }
  });

  if (result.post.authorId !== authorId) {
    await NotificationServices.createNotification({
      userId: result.post.authorId,
      type: NotificationType.COMMENT,
      referenceId: authorId,
      message: `${result.author.name} commented on your post.`,
    });
  }

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

const getCommentsByUser = async (userId: string) => {
  const result = await prisma.comment.findMany({
    where: { 
      authorId: userId,
    },
    include: { 
      author: { select: { id: true, name: true, avatarUrl: true } },
      post: { 
        select: { 
          id: true, 
          content: true,
          author: { select: { name: true } }
        } 
      },
      _count: {
        select: {
          likes: true,
          replies: true,
        }
      },
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
  getCommentsByUser,
  deleteComment,
};
