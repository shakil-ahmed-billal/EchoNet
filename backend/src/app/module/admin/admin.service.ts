import prisma from '../../lib/prisma.js';
import { QueryBuilder } from '../../utils/QueryBuilder.js';
import { PropertyStatus, ProductStatus } from '../../../../generated/prisma/client/index.js';
import { extractCloudinaryPublicId } from '../../utils/cloudinaryUtils.js';
import { deleteMedia } from '../../lib/cloudinary.js';

const getDashboardStats = async () => {
  const [
    totalUsers,
    totalProperties,
    pendingProperties,
    totalProducts,
    flaggedProducts,
    totalOrders,
    totalRevenue,
    activeAgents,
    flaggedPosts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.property.count({ where: { deletedAt: null } }),
    prisma.property.count({ where: { status: PropertyStatus.PENDING, deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { status: ProductStatus.FLAGGED, deletedAt: null } }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true }
    }),
    prisma.agentProfile.count({ where: { isVerified: true } }),
    prisma.post.count({ where: { status: 'FLAGGED', deletedAt: null } }),
  ]);

  return {
    users: { total: totalUsers },
    properties: { total: totalProperties, pending: pendingProperties },
    products: { total: totalProducts, flagged: flaggedProducts },
    posts: { flagged: flaggedPosts },
    orders: { total: totalOrders, totalRevenue: totalRevenue._sum.totalAmount || 0 },
    agents: { total: activeAgents }
  };
};

const getAllUsers = async (query: any) => {
  return await new QueryBuilder(prisma.user, query, {
      searchableFields: ['name', 'email'],
      filterableFields: ['role', 'status'],
  })
  .search()
  .filter()
  .sort()
  .paginate()
  .execute();
};

const getAllPosts = async (query: any) => {
  return await new QueryBuilder(prisma.post, query, {
      searchableFields: ['content'],
      filterableFields: ['status', 'userId'],
  })
  .search()
  .filter()
  .sort()
  .paginate()
  .include({
      author: { select: { id: true, name: true, avatarUrl: true } }
  } as any)
  .execute();
};

const getAllStories = async (query: any) => {
  return await new QueryBuilder(prisma.story, query, {
      filterableFields: ['userId'],
  })
  .filter()
  .sort()
  .paginate()
  .include({
      author: { select: { id: true, name: true, avatarUrl: true } }
  } as any)
  .execute();
};

const getAllProducts = async (query: any) => {
  return await new QueryBuilder(prisma.product, query, {
      searchableFields: ['title', 'description'],
      filterableFields: ['status', 'storeId', 'categoryId'],
  })
  .search()
  .filter()
  .sort()
  .paginate()
  .include({
      store: { select: { id: true, name: true } }
  } as any)
  .execute();
};

const getAllProperties = async (query: any) => {
  return await new QueryBuilder(prisma.property, query, {
      searchableFields: ['title', 'description'],
      filterableFields: ['status', 'ownerId', 'categoryId'],
  })
  .search()
  .filter()
  .sort()
  .paginate()
  .include({
      owner: { select: { id: true, name: true } }
  } as any)
  .execute();
};

const deleteUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: { select: { mediaUrls: true } },
      stories: { select: { mediaUrl: true } },
    }
  });

  if (!user) throw new Error('User not found');

  // 1. Map all Cloudinary assets tied to this user
  const cloudinaryUrlsToDelete: string[] = [];
  
  if (user.avatarUrl) cloudinaryUrlsToDelete.push(user.avatarUrl);
  user.posts.forEach((post: any) => {
    if (post.mediaUrls && Array.isArray(post.mediaUrls)) {
      post.mediaUrls.forEach((url: string) => cloudinaryUrlsToDelete.push(url));
    }
  });
  user.stories.forEach((story: any) => {
    if (story.mediaUrl) cloudinaryUrlsToDelete.push(story.mediaUrl);
  });

  // Execute Parallel CDN Wipes
  if (cloudinaryUrlsToDelete.length > 0) {
    console.log(`[Admin Wipe] Obliterating ${cloudinaryUrlsToDelete.length} files from Cloudinary for User ${userId}`);
    await Promise.all(
      cloudinaryUrlsToDelete.map(async (url) => {
        const publicId = extractCloudinaryPublicId(url);
        if (publicId) {
          try { await deleteMedia(publicId); } catch (_) {}
        }
      })
    );
  }

  // 2. Cascade DB Destruction safely inside a massive atomic block
  const result = await prisma.$transaction([
    prisma.comment.deleteMany({ where: { authorId: userId } }),
    prisma.like.deleteMany({ where: { userId } }),
    prisma.reaction.deleteMany({ where: { userId } }),
    prisma.savedPost.deleteMany({ where: { userId } }),
    prisma.postHashtag.deleteMany({ where: { post: { authorId: userId } } }),
    prisma.postTag.deleteMany({ where: { post: { authorId: userId } } }),
    prisma.post.deleteMany({ where: { authorId: userId } }),
    prisma.storyView.deleteMany({ where: { viewerId: userId } }),
    prisma.storyReaction.deleteMany({ where: { userId } }),
    prisma.story.deleteMany({ where: { authorId: userId } }),
    prisma.follow.deleteMany({ where: { OR: [{ followerId: userId }, { followingId: userId }] } }),
    prisma.message.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } }),
    prisma.notification.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  return { message: 'User and all associated data completely obliterated.' };
};

const deleteStory = async (storyId: string) => {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) throw new Error('Story not found');

  const publicId = extractCloudinaryPublicId(story.mediaUrl);
  if (publicId) {
    try { await deleteMedia(publicId); } catch (_) {}
  }

  await prisma.$transaction([
    prisma.storyView.deleteMany({ where: { storyId } }),
    prisma.storyReaction.deleteMany({ where: { storyId } }),
    prisma.story.delete({ where: { id: storyId } }),
  ]);

  return { message: 'Story deleted successfully.' };
};

export const AdminServices = {
  getDashboardStats,
  getAllUsers,
  getAllPosts,
  getAllStories,
  getAllProducts,
  getAllProperties,
  deleteUser,
  deleteStory,
};
