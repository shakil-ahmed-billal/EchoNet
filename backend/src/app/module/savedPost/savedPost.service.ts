import prisma from '../../lib/prisma.js';

const savePost = async (userId: string, postId: string) => {
    return await prisma.savedPost.upsert({
        where: { userId_postId: { userId, postId } },
        update: {},
        create: { userId, postId }
    });
};

const unsavePost = async (userId: string, postId: string) => {
    return await prisma.savedPost.delete({
        where: { userId_postId: { userId, postId } }
    });
};

const getSavedPosts = async (userId: string, limit: number = 20, cursor?: string) => {
    const result = await prisma.savedPost.findMany({
        where: { userId },
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
            post: {
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
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const hasNextPage = result.length > limit;
    const items = hasNextPage ? result.slice(0, -1) : result;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return {
        posts: items.map(item => item.post),
        nextCursor
    };
};

export const SavedPostServices = {
    savePost,
    unsavePost,
    getSavedPosts
};
