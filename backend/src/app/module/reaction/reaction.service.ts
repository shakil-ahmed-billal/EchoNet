import prisma from '../../lib/prisma.js';
import { ReactionType } from '../../../../generated/prisma/client/index.js';

const toggleReaction = async (userId: string, payload: { postId?: string; commentId?: string; type: ReactionType }) => {
    const where = {
        userId,
        postId: payload.postId || null,
        commentId: payload.commentId || null,
    };

    const existingReaction = await prisma.reaction.findFirst({
        where: {
            userId,
            postId: payload.postId || null,
            commentId: payload.commentId || null,
        },
    });

    if (existingReaction) {
        if (existingReaction.type === payload.type) {
            // Remove reaction if same type
            await prisma.reaction.delete({ where: { id: existingReaction.id } });
            
            // Update counter (assuming we still want to keep likesCount for simple display)
            if (payload.postId) {
                await prisma.post.update({ where: { id: payload.postId }, data: { likesCount: { decrement: 1 } } });
            } else if (payload.commentId) {
                await prisma.comment.update({ where: { id: payload.commentId }, data: { likesCount: { decrement: 1 } } });
            }
            return { reacted: false, type: null };
        } else {
            // Update reaction type if different
            const updated = await prisma.reaction.update({
                where: { id: existingReaction.id },
                data: { type: payload.type }
            });
            return { reacted: true, type: updated.type };
        }
    } else {
        // Create new reaction
        const result = await prisma.reaction.create({
            data: {
                userId,
                postId: payload.postId || null,
                commentId: payload.commentId || null,
                type: payload.type
            },
        });
        
        // Update counter
        if (payload.postId) {
            await prisma.post.update({ where: { id: payload.postId }, data: { likesCount: { increment: 1 } } });
            
            // Send Notification
            const post = await prisma.post.findUnique({ where: { id: payload.postId }, include: { author: true } });
            const reactor = await prisma.user.findUnique({ where: { id: userId } });
            if (post && post.authorId !== userId) {
                await prisma.notification.create({
                    data: {
                        userId: post.authorId,
                        type: 'REACTION',
                        referenceId: post.id,
                        message: `${reactor?.name} reacted with ${payload.type} to your post.`
                    }
                });
            }
        } else if (payload.commentId) {
            await prisma.comment.update({ where: { id: payload.commentId }, data: { likesCount: { increment: 1 } } });
            
            // Send Notification
            const comment = await prisma.comment.findUnique({ where: { id: payload.commentId }, include: { author: true } });
            const reactor = await prisma.user.findUnique({ where: { id: userId } });
            if (comment && comment.authorId !== userId) {
                await prisma.notification.create({
                    data: {
                        userId: comment.authorId,
                        type: 'REACTION',
                        referenceId: comment.id,
                        message: `${reactor?.name} reacted with ${payload.type} to your comment.`
                    }
                });
            }
        }
        return { reacted: true, type: result.type };
    }
};

export const ReactionServices = {
    toggleReaction,
};
