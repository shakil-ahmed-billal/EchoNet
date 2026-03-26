import prisma from '../../lib/prisma.js';
import ApiError from '../../errorHelpers/ApiError.js';
import httpStatus from 'http-status';

const followUser = async (followerId: string, followingId: string) => {
    if (followerId === followingId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "You cannot follow yourself");
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } }
    });

    if (existing) {
      return existing; // Already pending or accepted
    }

    const result = await prisma.follow.create({
        data: {
            followerId,
            followingId,
        },
    });

    const follower = await prisma.user.findUnique({ where: { id: followerId } });

    await prisma.notification.create({
        data: {
           userId: followingId,
           type: 'FRIEND_REQUEST',
           referenceId: followerId,
           message: `${follower?.name} sent you a friend request.`,
        }
    });

    return result;
};

const acceptFollow = async (receiverId: string, senderId: string) => {
   const result = await prisma.follow.update({
       where: {
           followerId_followingId: {
               followerId: senderId,
               followingId: receiverId,
           }
       },
       data: {
           status: 'ACCEPTED'
       }
   });

   const receiver = await prisma.user.findUnique({ where: { id: receiverId } });

   await prisma.notification.create({
       data: {
          userId: senderId,
          type: 'FRIEND_ACCEPT',
          referenceId: receiverId,
          message: `${receiver?.name} accepted your friend request.`,
       }
   });

   return result;
}

const unfollowUser = async (userId1: string, userId2: string) => {
    const result = await prisma.follow.deleteMany({
        where: {
            OR: [
                { followerId: userId1, followingId: userId2 },
                { followerId: userId2, followingId: userId1 },
            ]
        },
    });
    return result;
};

const getFollowers = async (userId: string) => {
    const result = await prisma.follow.findMany({
        where: { followingId: userId, status: 'ACCEPTED' },
        include: { follower: true },
    });
    return result.map(f => f.follower);
};

const getFollowing = async (userId: string, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const result = await prisma.follow.findMany({
        where: { followerId: userId, status: 'ACCEPTED' },
        include: { following: true },
        skip,
        take: limit,
    });
    return result.map(f => f.following);
};

const getPendingRequests = async (userId: string, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const result = await prisma.follow.findMany({
        where: { followingId: userId, status: 'PENDING' },
        include: { follower: true },
        skip,
        take: limit,
    });
    return result.map(f => f.follower);
};

const getSuggestions = async (userId: string, page = 1, limit = 15) => {
    const skip = (page - 1) * limit;
    // Users who are not the current user AND don't have a follow record where current user is follower
    const result = await prisma.user.findMany({
        where: {
            AND: [
                { id: { not: userId } },
                { isDeleted: false },
                {
                    NOT: {
                        followers: {
                            some: { followerId: userId }
                        }
                    }
                },
                {
                    NOT: {
                        following: {
                            some: { followingId: userId }
                        }
                    }
                }
            ]
        },
        skip,
        take: limit,
    });
    return result;
};

export const FollowServices = {
    followUser,
    acceptFollow,
    unfollowUser,
    getFollowers,
    getFollowing,
    getPendingRequests,
    getSuggestions,
};
