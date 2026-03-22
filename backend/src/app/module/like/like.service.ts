import prisma from '../../lib/prisma.js';

const toggleLike = async (userId: string, payload: { postId?: string; commentId?: string }) => {
  const existingLike = await prisma.like.findFirst({
    where: {
      userId,
      postId: payload.postId || null,
      commentId: payload.commentId || null,
    },
  });

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
      await prisma.post.update({ where: { id: payload.postId }, data: { likesCount: { increment: 1 } } });
    } else if (payload.commentId) {
      await prisma.comment.update({ where: { id: payload.commentId }, data: { likesCount: { increment: 1 } } });
    }
    return { liked: true };
  }
};

export const LikeServices = {
  toggleLike,
};
