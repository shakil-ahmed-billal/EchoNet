import prisma from '../../lib/prisma.js';
import { PostStatus } from '../../../../generated/prisma/client/index.js';

const createPost = async (authorId: string, payload: { content?: string; mediaUrls?: string[] }) => {
  const result = await prisma.post.create({
    data: {
      authorId,
      content: payload.content,
      mediaUrls: payload.mediaUrls || [],
    },
    include: { author: true },
  });
  return result;
};

const getAllPosts = async (limit: number = 10, cursor?: string, userId?: string, discover: boolean = false, authorId?: string) => {
  let where: any = {};
  
  if (authorId) {
    where.authorId = authorId;
  } else if (userId && !discover) {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f: any) => f.followingId);
    where.authorId = { in: [...followingIds, userId] };
  }
  
  where.status = 'ACTIVE';

  const result = await prisma.post.findMany({
    where,
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    include: { 
      author: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        }
      },
      likes: userId ? {
        where: { userId },
        select: { id: true }
      } : false
    },
    orderBy: { createdAt: 'desc' },
  });

  const hasNextPage = result.length > limit;
  const posts = hasNextPage ? result.slice(0, -1) : result;
  
  // Map posts to include a boolean isLiked
  const mappedPosts = posts.map(post => ({
    ...post,
    isLiked: userId ? (post.likes && post.likes.length > 0) : false,
    likes: undefined // cleanup the nested likes array
  }));

  const nextCursor = hasNextPage ? posts[posts.length - 1].id : null;

  return {
    posts: mappedPosts,
    nextCursor,
  };
};

const updatePostStatus = async (id: string, status: PostStatus) => {
  const result = await prisma.post.update({
    where: { id },
    data: { status },
  });
  return result;
};

const updatePost = async (id: string, authorId: string, payload: { content?: string; mediaUrls?: string[] }) => {
  // Verify ownership
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || post.authorId !== authorId) {
    throw new Error('Unauthorized or post not found');
  }

  const result = await prisma.post.update({
    where: { id },
    data: {
      content: payload.content,
      mediaUrls: payload.mediaUrls,
    },
    include: { author: true },
  });
  return result;
};

const deletePost = async (id: string, authorId: string, isAdmin: boolean = false) => {
  // Verify ownership unless admin
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    throw new Error('Post not found');
  }

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error('Unauthorized');
  }

  const result = await prisma.post.delete({
    where: { id },
  });
  return result;
};

export const PostServices = {
  createPost,
  getAllPosts,
  updatePostStatus,
  updatePost,
  deletePost,
};
