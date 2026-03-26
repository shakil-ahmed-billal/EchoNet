import prisma from '../../lib/prisma.js';

const upsertHashtags = async (content: string, postId: string) => {
    const hashtags = content.match(/#(\w+)/g);
    
    // Remove existing post-hashtag links
    await prisma.postHashtag.deleteMany({
        where: { postId }
    });

    if (!hashtags) return;

    const uniqueTags = Array.from(new Set(hashtags.map(tag => tag.slice(1).toLowerCase())));

    for (const tag of uniqueTags) {
        const hashtag = await prisma.hashtag.upsert({
            where: { tag },
            update: { postCount: { increment: 1 } },
            create: { tag, postCount: 1 }
        });

        await prisma.postHashtag.create({
            data: {
                postId,
                hashtagId: hashtag.id
            }
        });
    }
};

const getTrendingHashtags = async (limit: number = 10) => {
    const result = await prisma.hashtag.findMany({
        orderBy: { postCount: 'desc' },
        take: limit
    });
    return result;
};

export const HashtagServices = {
    upsertHashtags,
    getTrendingHashtags
};
