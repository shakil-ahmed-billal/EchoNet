import express from 'express';
import { PostControllers } from './post.controller.js';
import auth, { optionalAuth } from '../../middleware/auth.js';
import { Role } from '../../../../generated/prisma/client/index.js';

import { upload } from '../../middleware/multer.js';
import { redisCache } from '../../utils/redisCache.js';

const router = express.Router();

router.post(
    '/',
    auth(Role.USER, Role.ADMIN, Role.MODERATOR),
    upload.array('media', 10),
    PostControllers.createPost
);
router.get('/', optionalAuth, redisCache('posts', 30), PostControllers.getAllPosts);
router.get('/:id', optionalAuth, PostControllers.getPostById);
router.patch('/:id', auth(Role.USER, Role.ADMIN, Role.MODERATOR), PostControllers.updatePost);
router.patch('/:id/status', auth(Role.ADMIN, Role.MODERATOR), PostControllers.updatePostStatus);
router.delete('/:id', auth(Role.ADMIN, Role.MODERATOR, Role.USER), PostControllers.deletePost);

export const PostRoutes = router;

