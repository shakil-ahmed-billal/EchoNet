import { prisma } from '../../lib/prisma.js';

const createGroup = async (payload: { name: string; memberIds: string[]; createdBy: string }) => {
    const { name, memberIds, createdBy } = payload;
    const allMemberIds = [...new Set([createdBy, ...memberIds])];

    const group = await prisma.group.create({
        data: {
            name,
            createdBy,
            members: {
                create: allMemberIds.map(userId => ({
                    userId,
                    role: userId === createdBy ? 'ADMIN' : 'MEMBER',
                })),
            },
        },
        include: {
            members: {
                include: { user: { select: { id: true, name: true, image: true } } }
            }
        }
    });
    return group;
};

const getUserGroups = async (userId: string) => {
    const groups = await prisma.group.findMany({
        where: {
            members: { some: { userId } }
        },
        include: {
            members: {
                include: { user: { select: { id: true, name: true, image: true } } }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    return groups;
};

export const GroupService = { createGroup, getUserGroups };
