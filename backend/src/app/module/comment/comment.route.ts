import express from 'express';
import { CommentControllers } from './comment.controller.js';

import auth from '../../middleware/auth.js';
import { Role } from '../../../../generated/prisma/client/index.js';

const router = express.Router();

router.post('/post/:postId', auth(Role.USER, Role.ADMIN, Role.MODERATOR), CommentControllers.createComment);
router.get('/post/:postId', CommentControllers.getCommentsForPost);
router.delete('/:id', auth(Role.USER, Role.ADMIN, Role.MODERATOR), CommentControllers.deleteComment);

export const CommentRoutes = router;
