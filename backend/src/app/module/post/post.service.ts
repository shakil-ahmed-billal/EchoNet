import prisma from '../../lib/prisma.js';
import { PostStatus } from '../../../../generated/prisma/client/index.js';
import { uploadMedia, deleteMedia } from '../../lib/cloudinary.js';
import fs from 'fs';
import { HashtagServices } from '../hashtag/hashtag.service.js';

const createPost = async (authorId: string, payload: { content?: string }, files?: Express.Multer.File[]) => {
    const uploadedMedia: { url: string; public_id: string }[] = [];
    try {
        console.log("PostServices.createPost called with authorId:", authorId, "payload:", payload);

        if (files && files.length > 0) {
            for (const file of files) {
                console.log("Uploading file to Cloudinary:", file.path);
                const result = await uploadMedia(file.path);
                uploadedMedia.push(result);
                // Clean up local file after successful upload
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }

        console.log("Creating post in database with mediaUrls:", uploadedMedia.map(m => m.url));
        const post = await prisma.post.create({
            data: {
                authorId,
                content: payload.content,
                mediaUrls: uploadedMedia.map((m) => m.url),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        });
        
        console.log("Post created successfully:", post.id);

        // Extract and upsert hashtags
        if (payload.content) {
            await HashtagServices.upsertHashtags(payload.content, post.id);
        }

        return post;
    } catch (error: any) {
        console.error("PostServices.createPost ERROR:", error);
        // Rollback: delete any uploaded images from Cloudinary if DB failed.
        if (uploadedMedia.length > 0) {
            console.log("Rolling back Cloudinary uploads due to DB error.");
            for (const media of uploadedMedia) {
                await deleteMedia(media.public_id);
            }
        }
        
        // Also cleanup remaining temp files if any
        if (files) {
            for (const file of files) {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }
        
        throw error;
    }
};

const getScoredFeed = async (userId: string, limit: number = 20, cursor?: string) => {
    // 1. Fetch candidate posts from followed users (last 72 hours)
    const following = await prisma.follow.findMany({
        where: { followerId: userId, status: 'ACCEPTED' },
        select: { followingId: true }
    });
    const followingIds = following.map(f => f.followingId);
    
    // Include user's own posts in the feed candidates
    const authorIds = [...followingIds, userId];

    const seventyTwoHoursAgo = new Date();
    seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72);

    const posts = await prisma.post.findMany({
        where: {
            authorId: { in: authorIds },
            status: 'ACTIVE',
            createdAt: { gte: seventyTwoHoursAgo },
            deletedAt: null,
        },
        include: {
            author: {
                select: { id: true, name: true, avatarUrl: true }
            },
            _count: {
                select: {
                    reactions: true,
                    comments: true,
                    savedBy: true,
                }
            },
            reactions: {
                where: { userId },
                select: { id: true, type: true }
            },
            savedBy: {
                where: { userId },
                select: { id: true }
            }
        }
    });

    // 2. Score each post
    const now = new Date();
    const scoredPosts = posts.map(post => {
        const hoursSince = (now.getTime() - post.createdAt.getTime()) / (1000 * 60 * 60);
        const recentness = Math.max(0, 48 - hoursSince);
        const timePenalty = hoursSince * 0.5;
        
        // For Phase 1, relBoost is 1.3 for followed users, 1.0 for self
        const isSelf = post.authorId === userId;
        const relBoost = isSelf ? 1.0 : 1.3;

        const score = (
            (post._count.reactions * 2) +
            (post._count.comments * 3) +
            (post._count.savedBy * 5) +
            recentness
        ) * relBoost - timePenalty;

        return {
            ...post,
            score,
            isLiked: post.reactions.length > 0,
            isSaved: post.savedBy.length > 0,
            reactions: undefined,
            savedBy: undefined,
        };
    });

    // 3. Sort by score descending
    scoredPosts.sort((a, b) => b.score - a.score);

    // 4. Cursor-based pagination (simulated for the sorted array)
    let startIndex = 0;
    if (cursor) {
        const cursorIndex = scoredPosts.findIndex(p => p.id === cursor);
        if (cursorIndex !== -1) {
            startIndex = cursorIndex + 1;
        }
    }

    const paginatedPosts = scoredPosts.slice(startIndex, startIndex + limit);
    const hasNextPage = scoredPosts.length > startIndex + limit;
    const nextCursor = hasNextPage ? paginatedPosts[paginatedPosts.length - 1].id : null;

    return {
        posts: paginatedPosts,
        nextCursor,
    };
};

const getAllPosts = async (limit: number = 10, cursor?: string, userId?: string, discover: boolean = false, authorId?: string) => {
  if (userId && !discover && !authorId) {
      return getScoredFeed(userId, limit, cursor);
  }

  let where: any = { deletedAt: null };
  
  if (authorId) {
    where.authorId = authorId;
  } else if (userId && discover) {
    // For discover, we show posts from people we DON'T follow
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f: any) => f.followingId);
    where.authorId = { notIn: [...followingIds, userId] };
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
          reactions: true,
          savedBy: true,
        }
      },
      reactions: userId ? {
        where: { userId },
        select: { id: true, type: true }
      } : false,
      savedBy: userId ? {
        where: { userId },
        select: { id: true }
      } : false
    },
    orderBy: { createdAt: 'desc' },
  });

  const hasNextPage = result.length > limit;
  const posts = hasNextPage ? result.slice(0, -1) : result;
  
  const mappedPosts = posts.map(post => ({
    ...post,
    isLiked: userId ? (post.reactions && post.reactions.length > 0) : false,
    isSaved: userId ? (post.savedBy && post.savedBy.length > 0) : false,
    reactions: undefined,
    savedBy: undefined
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

  if (payload.content) {
      await HashtagServices.upsertHashtags(payload.content, id);
  }

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
