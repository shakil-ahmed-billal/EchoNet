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
  return setting;
};

export const SettingServices = {
  getSetting,
  updateSetting,
};
