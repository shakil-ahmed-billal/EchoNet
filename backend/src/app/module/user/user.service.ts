import prisma from '../../lib/prisma.js';

const getAllUsers = async (query: Record<string, unknown>, currentUserId?: string) => {
  const filters: any = {};
  if (query.searchTerm) {
    filters.OR = [
      { name: { contains: query.searchTerm as string, mode: 'insensitive' } },
      { email: { contains: query.searchTerm as string, mode: 'insensitive' } }
    ];
  }

  const result = await prisma.user.findMany({
    where: Object.keys(filters).length > 0 ? filters : undefined,
    include: currentUserId ? {
      followers: {
        where: { followerId: currentUserId }
      },
      following: {
         where: { followingId: currentUserId }
      }
    } : undefined
  });

  if (!currentUserId) return result;

  return result.map((u: any) => {
    let isFollowing = false;
    let isFriend = false;
    
    // Check if we sent them a request
    if (u.followers && u.followers.length > 0) {
       if (u.followers[0].status === 'PENDING') isFollowing = true;
       if (u.followers[0].status === 'ACCEPTED') isFriend = true;
    }
    // Check if they sent us a request and it's accepted
    if (u.following && u.following.length > 0) {
       if (u.following[0].status === 'ACCEPTED') isFriend = true;
    }

    return {
       ...u,
       isFollowing,
       isFriend,
       followers: undefined,
       following: undefined
    };
  });
};

const getUserById = async (id: string, currentUserId?: string) => {
  const result = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          followers: { where: { status: 'ACCEPTED' } },
          following: { where: { status: 'ACCEPTED' } },
          posts: true,
        }
      },
      followers: currentUserId ? {
        where: { followerId: currentUserId },
        select: { followerId: true, status: true }
      } : false,
      following: currentUserId ? {
        where: { followingId: currentUserId },
        select: { followingId: true, status: true }
      } : false
    }
  });

  if (!result) return null;

  let isFollowing = false;
  let isFriend = false;

  if (result.followers && result.followers.length > 0) {
      if ((result.followers[0] as any).status === 'PENDING') isFollowing = true;
      if ((result.followers[0] as any).status === 'ACCEPTED') isFriend = true;
  }
  if (result.following && result.following.length > 0) {
      if ((result.following[0] as any).status === 'ACCEPTED') isFriend = true;
  }

  return {
    ...result,
    isFollowing,
    isFriend,
    followers: undefined,
    following: undefined
  };
};

const updateUser = async (id: string, payload: any) => {
  const result = await prisma.user.update({
    where: { id },
    data: payload,
  });
  return result;
};

const suspendUser = async (id: string) => {
  const result = await prisma.user.update({
    where: { id },
    data: { isSuspended: true },
  });
  return result;
};

export const UserServices = {
  getAllUsers,
  getUserById,
  updateUser,
  suspendUser,
};
