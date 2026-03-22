import prisma from '../../lib/prisma.js';

const getAllUsers = async (query: Record<string, unknown>) => {
  const result = await prisma.user.findMany();
  return result;
};

const getUserById = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: { id },
  });
  return result;
};

const updateUser = async (id: string, payload: any) => {
  const result = await prisma.user.update({
    where: { id },
    data: payload,
  });
  return result;
};

const suspendUser = async (id: string) => {
  const result = await prisma.user.update({
    where: { id },
    data: { isSuspended: true },
  });
  return result;
};

export const UserServices = {
  getAllUsers,
  getUserById,
  updateUser,
  suspendUser,
};
