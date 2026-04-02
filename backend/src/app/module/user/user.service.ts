import prisma from '../../lib/prisma.js';
import { QueryBuilder } from '../../utils/QueryBuilder.js';

const getAllUsers = async (query: Record<string, unknown>, currentUserId?: string) => {
  const result = await new QueryBuilder(prisma.user, query, {
    searchableFields: ['name', 'email'],
    filterableFields: ['role', 'isSuspended'],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .execute();

  if (!currentUserId) return result;

  const enriched = (result.data as any[]).map((u: any) => {
    const isFollowing = u.followers?.some((f: any) => f.status === 'PENDING') ?? false;
    const isFriend = u.followers?.some((f: any) => f.status === 'ACCEPTED') ?? false;
    return { ...u, isFollowing, isFriend, followers: undefined, following: undefined };
  });

  return { ...result, data: enriched };
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
        select: { status: true }
      } : false,
      following: currentUserId ? {
        where: { followingId: currentUserId },
        select: { status: true }
      } : false
    }
  });

  if (!result) return null;

  let isFollowing = false;
  let isFriend = false;
  let followStatus: 'PENDING' | 'ACCEPTED' | 'NONE' = 'NONE';

  if (result.followers && result.followers.length > 0) {
      followStatus = result.followers[0].status as any;
      if (result.followers[0].status === 'ACCEPTED') {
          isFollowing = true;
          // Check for mutual follow
          if (result.following && result.following.length > 0 && result.following[0].status === 'ACCEPTED') {
              isFriend = true;
          }
      }
  }

  return {
    ...result,
    isFollowing,
    isFriend,
    followStatus,
    followers: undefined,
    following: undefined
  };
};

const updateUser = async (id: string, payload: any) => {
  // Sanitize payload: only allow known, updatable user fields
  const allowedFields = ['name', 'bio', 'avatarUrl', 'coverPhotoUrl', 'website', 'location', 'isPrivate', 'phoneNumber', 'image'];
  const data: Record<string, any> = {};

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      data[field] = payload[field];
    }
  }

  // Map `workplace` string to `workplaces` JSON array
  if (payload.workplace !== undefined && payload.workplace !== null) {
    const wp = String(payload.workplace).trim();
    data.workplaces = wp ? [wp] : [];
  }

  // Map `education` string to `education` JSON array
  if (payload.education !== undefined && payload.education !== null) {
    const ed = String(payload.education).trim();
    data.education = ed ? [ed] : [];
  }

  // Ensure boolean type
  if (data.isPrivate !== undefined) {
    data.isPrivate = Boolean(data.isPrivate);
  }

  const result = await prisma.user.update({
    where: { id },
    data,
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
