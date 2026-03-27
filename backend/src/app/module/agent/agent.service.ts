import prisma from '../../lib/prisma.js';
import { QueryBuilder } from '../../utils/QueryBuilder.js';

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
  return await new QueryBuilder(prisma.agentProfile, query, {
    searchableFields: ['agencyName', 'licenseNo', 'user.name'],
    filterableFields: ['isVerified'],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .include({
      user: { select: { id: true, name: true, avatarUrl: true, email: true } }
    } as any)
    .execute();
};

const createAgentProfile = async (userId: string, payload: any) => {
  return await prisma.agentProfile.create({
    data: {
      userId,
      ...payload,
      isVerified: false,
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
