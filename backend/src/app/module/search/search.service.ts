import prisma from '../../lib/prisma.js';

const globalSearch = async (searchTerm: string, type: 'users' | 'posts' | 'tags' = 'users', limit: number = 20) => {
    if (type === 'users') {
        const result = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { email: { contains: searchTerm, mode: 'insensitive' } },
                    { bio: { contains: searchTerm, mode: 'insensitive' } }
                ],
                isDeleted: false
            },
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                bio: true,
                followersCount: true,
                followingCount: true
            }
        });
        return result;
    }

    if (type === 'posts') {
        // Simple text search for Phase 1 (PostgreSQL tsvector can be added later as an optimization)
        const result = await prisma.post.findMany({
            where: {
                content: { contains: searchTerm, mode: 'insensitive' },
                status: 'ACTIVE',
                deletedAt: null
            },
            take: limit,
            include: {
                author: {
                    select: { id: true, name: true, avatarUrl: true }
                },
                _count: {
                    select: {
                        reactions: true,
                        comments: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return result;
    }

    if (type === 'tags') {
        const result = await prisma.hashtag.findMany({
            where: {
                tag: { contains: searchTerm.startsWith('#') ? searchTerm.slice(1).toLowerCase() : searchTerm.toLowerCase() }
            },
            take: limit,
            orderBy: { postCount: 'desc' }
        });
        return result;
    }

    return [];
};

export const SearchServices = {
    globalSearch
};
