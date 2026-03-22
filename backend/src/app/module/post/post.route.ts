import express from 'express';
import { PostControllers } from './post.controller.js';
import auth from '../../middleware/auth.js';
import { Role } from '../../../../generated/prisma/client/index.js';

const router = express.Router();

router.post('/', auth(Role.USER, Role.ADMIN, Role.MODERATOR), PostControllers.createPost);
router.get('/', auth(), PostControllers.getAllPosts);
router.patch('/:id', auth(Role.USER, Role.ADMIN, Role.MODERATOR), PostControllers.updatePost);
router.patch('/:id/status', auth(Role.ADMIN, Role.MODERATOR), PostControllers.updatePostStatus);
router.delete('/:id', auth(Role.ADMIN, Role.MODERATOR, Role.USER), PostControllers.deletePost);

export const PostRoutes = router;
