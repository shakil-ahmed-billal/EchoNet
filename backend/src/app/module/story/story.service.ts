import prisma from '../../lib/prisma.js';
import { uploadMedia, deleteMedia } from '../../lib/cloudinary.js';
import fs from 'fs';

const STORY_TTL_HOURS = 48;

// Cleanup expired stories from DB (called on every GET)
const cleanupExpiredStories = async () => {
  const expiredStories = await prisma.story.findMany({
    where: { expiresAt: { lt: new Date() } },
    select: { id: true, mediaUrl: true },
  });

  if (expiredStories.length > 0) {
    // Delete from Cloudinary and DB
    for (const story of expiredStories) {
      try {
        // Extract public_id from URL
        const parts = story.mediaUrl.split('/');
        const filename = parts[parts.length - 1];
        const publicId = filename.split('.')[0];
        await deleteMedia(publicId);
      } catch (_) {}
    }
    await prisma.story.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
};

// GET all active stories from all users
const getStories = async (currentUserId: string) => {
  await cleanupExpiredStories();

  const stories = await prisma.story.findMany({
    where: {
      expiresAt: { gt: new Date() },
    },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true, image: true },
      },
      views: {
        where: { viewerId: currentUserId },
        select: { id: true },
      },
      _count: { select: { views: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Group by author, own stories first
  const grouped: Record<string, any> = {};
  for (const story of stories) {
    if (!grouped[story.authorId]) {
      grouped[story.authorId] = {
        author: story.author,
        stories: [],
        hasUnseen: false,
        isOwn: story.authorId === currentUserId,
      };
    }
    const isSeen = story.views.length > 0;
    if (!isSeen) grouped[story.authorId].hasUnseen = true;
    grouped[story.authorId].stories.push({
      id: story.id,
      mediaUrl: story.mediaUrl,
      caption: story.caption,
      expiresAt: story.expiresAt,
      createdAt: story.createdAt,
      isSeen,
      viewsCount: story._count.views,
    });
  }

  // Sort: own stories first, then by hasUnseen, then rest
  return Object.values(grouped).sort((a, b) => {
    if (a.isOwn) return -1;
    if (b.isOwn) return 1;
    if (a.hasUnseen && !b.hasUnseen) return -1;
    if (!a.hasUnseen && b.hasUnseen) return 1;
    return 0;
  });
};

// POST create a story
const createStory = async (
  authorId: string,
  payload: { caption?: string },
  file?: Express.Multer.File
) => {
  let mediaUrl = '';

  if (file) {
    const result = await uploadMedia(file.path);
    mediaUrl = result.url;
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
  }

  if (!mediaUrl) throw new Error('Media file is required for a story');

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + STORY_TTL_HOURS);

  const story = await prisma.story.create({
    data: {
      authorId,
      mediaUrl,
      caption: payload.caption,
      expiresAt,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, image: true } },
    },
  });

  return story;
};

// DELETE own story
const deleteStory = async (storyId: string, currentUserId: string) => {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) throw new Error('Story not found');
  if (story.authorId !== currentUserId) throw new Error('Not authorized');

  // Delete from Cloudinary
  try {
    const parts = story.mediaUrl.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    await deleteMedia(publicId);
  } catch (_) {}

  await prisma.story.delete({ where: { id: storyId } });
  return { message: 'Story deleted' };
};

// POST view a story (mark as seen)
const viewStory = async (storyId: string, viewerId: string) => {
  await prisma.storyView.upsert({
    where: { storyId_viewerId: { storyId, viewerId } },
    create: { storyId, viewerId },
    update: { viewedAt: new Date() },
  });
  return { message: 'Story marked as viewed' };
};

export const StoryServices = { getStories, createStory, deleteStory, viewStory };
