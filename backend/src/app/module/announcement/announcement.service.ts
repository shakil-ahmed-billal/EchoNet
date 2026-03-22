import prisma from '../../lib/prisma.js';

const createAnnouncement = async (adminId: string, payload: { title: string; body: string }) => {
  const result = await prisma.announcement.create({
    data: {
      adminId,
      title: payload.title,
      body: payload.body,
    },
  });
  return result;
};

const getAnnouncements = async () => {
  const result = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return result;
};

export const AnnouncementServices = {
  createAnnouncement,
  getAnnouncements,
};
