import prisma from '../../lib/prisma.js';

const createReview = async (userId: string, productId: string, payload: { rating: number; comment: string }) => {
  const result = await prisma.productReview.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    update: {
      rating: payload.rating,
      comment: payload.comment,
    },
    create: {
      userId,
      productId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });
  return result;
};

const likeReview = async (userId: string, reviewId: string) => {
  const existingLike = await prisma.reviewLike.findUnique({
    where: {
      userId_reviewId: {
        userId,
        reviewId,
      },
    },
  });

  if (existingLike) {
    await prisma.reviewLike.delete({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });
    return { liked: false };
  } else {
    await prisma.reviewLike.create({
      data: {
        userId,
        reviewId,
      },
    });
    return { liked: true };
  }
};

const createReply = async (userId: string, reviewId: string, payload: { comment: string }) => {
  const result = await prisma.reviewReply.create({
    data: {
      userId,
      reviewId,
      comment: payload.comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });
  return result;
};

export const ProductReviewServices = {
  createReview,
  likeReview,
  createReply,
};
