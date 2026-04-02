import prisma from '../../lib/prisma.js';
import { NotificationServices } from '../notification/notification.service.js';
import { NotificationType } from '../../../../generated/prisma/client/index.js';

const toggleLike = async (userId: string, payload: { postId?: string; commentId?: string }) => {
  const existingLike = await prisma.like.findFirst({
    where: {
      userId,
      postId: payload.postId || null,
      commentId: payload.commentId || null,
    },
  });

  const liker = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
    if (payload.postId) {
      await prisma.post.update({ where: { id: payload.postId }, data: { likesCount: { decrement: 1 } } });
    } else if (payload.commentId) {
      await prisma.comment.update({ where: { id: payload.commentId }, data: { likesCount: { decrement: 1 } } });
    }
    return { liked: false };
  } else {
    await prisma.like.create({
      data: {
        userId,
        postId: payload.postId || null,
        commentId: payload.commentId || null,
      },
    });

    if (payload.postId) {
      const post = await prisma.post.update({ 
        where: { id: payload.postId }, 
        data: { likesCount: { increment: 1 } },
        select: { authorId: true }
      });
      
      if (post.authorId !== userId) {
        await NotificationServices.createNotification({
          userId: post.authorId,
          type: NotificationType.LIKE,
          referenceId: userId,
          message: `${liker?.name} liked your post.`,
        });
      }
    } else if (payload.commentId) {
      const comment = await prisma.comment.update({ 
        where: { id: payload.commentId }, 
        data: { likesCount: { increment: 1 } },
        select: { authorId: true }
      });

      if (comment.authorId !== userId) {
        await NotificationServices.createNotification({
          userId: comment.authorId,
          type: NotificationType.LIKE,
          referenceId: userId,
          message: `${liker?.name} liked your comment.`,
        });
      }
    }
    return { liked: true };
  }
};

export const LikeServices = {
  toggleLike,
};
