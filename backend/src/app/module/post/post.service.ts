import prisma from '../../lib/prisma.js';
import { PostStatus } from '../../../../generated/prisma/client/index.js';
import { uploadMedia, deleteMedia } from '../../lib/cloudinary.js';
import fs from 'fs';

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
