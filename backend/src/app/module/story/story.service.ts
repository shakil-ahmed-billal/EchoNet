import prisma from '../../lib/prisma.js';
import { uploadMedia, deleteMedia } from '../../lib/cloudinary.js';
import { extractCloudinaryPublicId } from '../../utils/cloudinaryUtils.js';
import fs from 'fs';

const STORY_TTL_HOURS_DEFAULT = 48;

// Cleanup expired stories from DB (called on every GET)
const cleanupExpiredStories = async () => {
  const expiredStories = await prisma.story.findMany({
    where: { expiresAt: { lt: new Date() } },
    select: { id: true, mediaUrl: true },
  });

  if (expiredStories.length > 0) {
    // Delete from Cloudinary and DB
    for (const story of expiredStories) {
      const publicId = extractCloudinaryPublicId(story.mediaUrl);
      if (publicId) {
        console.log(`[Story GC] Obliterating expired Cloudinary asset: ${publicId}`);
        try { await deleteMedia(publicId); } catch (_) {}
      }
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

  const durationSetting = await prisma.globalSetting.findUnique({
    where: { key: 'story_duration' },
  });

  const expiresAt = new Date();
  const duration = durationSetting?.value || '2'; // default to 2 days

  if (duration === 'unlimited') {
    // Set to 100 years in the future
    expiresAt.setFullYear(expiresAt.getFullYear() + 100);
  } else {
    const days = parseInt(duration);
    expiresAt.setDate(expiresAt.getDate() + (isNaN(days) ? 2 : days));
  }

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

// DELETE own story or admin moderation
const deleteStory = async (storyId: string, currentUserId: string, isAdmin: boolean = false) => {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) throw new Error('Story not found');
  if (!isAdmin && story.authorId !== currentUserId) throw new Error('Not authorized');

  // Delete from Cloudinary
  const publicId = extractCloudinaryPublicId(story.mediaUrl);
  if (publicId) {
    console.log(`[Story Delete] Obliterating Cloudinary asset: ${publicId}`);
    try { await deleteMedia(publicId); } catch (_) {}
  }

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

// POST react to a story
const reactToStory = async (storyId: string, userId: string, type: any) => {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) throw new Error('Story not found');

  const reaction = await prisma.storyReaction.upsert({
    where: { storyId_userId: { storyId, userId } },
    create: { storyId, userId, type },
    update: { type },
  });

  // Create notification if not own story
  if (story.authorId !== userId) {
    await prisma.notification.create({
      data: {
        userId: story.authorId,
        type: 'REACTION',
        referenceId: storyId,
        message: `reacted to your story`,
      },
    });
  }

  return reaction;
};

// POST reply to a story (message)
const replyToStory = async (storyId: string, senderId: string, content: string) => {
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) throw new Error('Story not found');

  const message = await prisma.message.create({
    data: {
      senderId,
      receiverId: story.authorId,
      content,
      storyId,
    },
  });

  // Create notification
  if (story.authorId !== senderId) {
    await prisma.notification.create({
      data: {
        userId: story.authorId,
        type: 'MESSAGE',
        referenceId: message.id,
        message: `replied to your story: "${content.substring(0, 20)}..."`,
      },
    });
  }

  return message;
};

// GET story insights (views and reactions list)
const getStoryInsights = async (storyId: string, userId: string) => {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      views: {
        include: {
          viewer: { select: { id: true, name: true, image: true, avatarUrl: true } },
        },
        orderBy: { viewedAt: 'desc' },
      },
      reactions: {
        include: {
          user: { select: { id: true, name: true, image: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!story) throw new Error('Story not found');
  if (story.authorId !== userId) throw new Error('Not authorized to view insights');

  // Also get messages for this story
  const messages = await prisma.message.findMany({
    where: { storyId },
    include: {
      sender: { select: { id: true, name: true, image: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    views: story.views,
    reactions: story.reactions,
    messages,
    counts: {
      views: story.views.length,
      reactions: story.reactions.length,
      messages: messages.length,
    },
  };
};

export const StoryServices = { getStories, createStory, deleteStory, viewStory, reactToStory, replyToStory, getStoryInsights };
