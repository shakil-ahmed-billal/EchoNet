import prisma from '../../lib/prisma.js';

const createStore = async (userId: string, payload: { name: string; description?: string; logoUrl?: string; bannerUrl?: string }) => {
  const result = await prisma.store.create({
    data: {
      ...payload,
      ownerId: userId,
    },
  });
  return result;
};

const getStoreById = async (id: string, currentUserId?: string) => {
  const result = await prisma.store.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          products: { where: { status: 'ACTIVE' } },
          followers: true,
        },
      },
      followers: currentUserId ? {
        where: { userId: currentUserId },
        select: { id: true }
      } : false,
    },
  });

  if (!result) return null;

  return {
    ...result,
    isFollowing: result.followers ? result.followers.length > 0 : false,
    followers: undefined,
  };
};

const getMyStore = async (userId: string) => {
  const result = await prisma.store.findUnique({
    where: { ownerId: userId },
    include: {
      _count: {
        select: {
          products: true,
          followers: true,
          orders: true,
        },
      },
    },
  });
  return result;
};

const updateStore = async (userId: string, id: string, payload: any) => {
  // Ensure ownership
  const store = await prisma.store.findUnique({ where: { id } });
  if (!store || store.ownerId !== userId) {
    throw new Error('Not authorized to update this store');
  }

  const result = await prisma.store.update({
    where: { id },
    data: payload,
  });
  return result;
};

const toggleFollowStore = async (userId: string, storeId: string) => {
  const existingFollow = await prisma.storeFollow.findUnique({
    where: {
      userId_storeId: { userId, storeId },
    },
  });

  if (existingFollow) {
    await prisma.$transaction([
      prisma.storeFollow.delete({
        where: { id: existingFollow.id },
      }),
      prisma.store.update({
        where: { id: storeId },
        data: { followersCount: { decrement: 1 } },
      }),
    ]);
    return { followed: false };
  } else {
    await prisma.$transaction([
      prisma.storeFollow.create({
        data: { userId, storeId },
      }),
      prisma.store.update({
        where: { id: storeId },
        data: { followersCount: { increment: 1 } },
      }),
    ]);
    return { followed: true };
  }
};

export const StoreServices = {
  createStore,
  getStoreById,
  getMyStore,
  updateStore,
  toggleFollowStore,
};
