import prisma from '../../lib/prisma.js';

const getSetting = async (key: string) => {
  const setting = await prisma.globalSetting.findUnique({
    where: { key },
  });
  return setting?.value || null;
};

const updateSetting = async (key: string, value: string) => {
  const setting = await prisma.globalSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  if (key === 'story_duration') {
    const stories = await prisma.story.findMany({
      where: { expiresAt: { gt: new Date() } }
    });
    
    for (const story of stories) {
      const expiresAt = new Date(story.createdAt);
      if (value === 'unlimited') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 100);
      } else {
        const days = parseInt(value);
        expiresAt.setDate(expiresAt.getDate() + (isNaN(days) ? 2 : days));
      }
      
      await prisma.story.update({
        where: { id: story.id },
        data: { expiresAt }
      });
    }
  }

  return setting;
};

export const SettingServices = {
  getSetting,
  updateSetting,
};
