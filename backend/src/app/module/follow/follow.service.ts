import prisma from '../../lib/prisma.js';
import ApiError from '../../errorHelpers/ApiError.js';
import httpStatus from 'http-status';

const followUser = async (followerId: string, followingId: string) => {
    if (followerId === followingId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "You cannot follow yourself");
    }

    const result = await prisma.follow.create({
        data: {
            followerId,
            followingId,
        },
    });
    return result;
};

const unfollowUser = async (followerId: string, followingId: string) => {
    const result = await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId,
                followingId,
            },
        },
    });
    return result;
};

const getFollowers = async (userId: string) => {
    const result = await prisma.follow.findMany({
        where: { followingId: userId },
        include: { follower: true },
    });
    return result.map(f => f.follower);
};

const getFollowing = async (userId: string) => {
    const result = await prisma.follow.findMany({
        where: { followerId: userId },
        include: { following: true },
    });
    return result.map(f => f.following);
};

export const FollowServices = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
};
