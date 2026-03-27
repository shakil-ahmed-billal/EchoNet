import prisma from '../../lib/prisma.js';

const getAgentProfile = async (userId: string) => {
  return await prisma.agentProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, avatarUrl: true, email: true } },
      properties: {
        where: { deletedAt: null, status: 'ACTIVE' },
        include: { details: true, images: { where: { isCover: true } } }
      }
    }
  });
};

const getAllAgents = async (query: any = {}) => {
  const where: any = {};
  if (query.isVerified !== undefined) {
    where.isVerified = query.isVerified === 'true' || query.isVerified === true;
  }

  return await prisma.agentProfile.findMany({
    where,
    include: {
      user: { select: { name: true, avatarUrl: true, email: true } }
    },
    orderBy: { totalSales: 'desc' }
  });
};

const createAgentProfile = async (userId: string, payload: any) => {
  return await prisma.agentProfile.create({
    data: {
      userId,
      ...payload,
      isVerified: false, // Must be verified by admin
    }
  });
};

const verifyAgent = async (id: string) => {
  return await prisma.agentProfile.update({
    where: { id },
    data: { isVerified: true }
  });
};

export const AgentServices = {
  getAgentProfile,
  getAllAgents,
  createAgentProfile,
  verifyAgent,
};
