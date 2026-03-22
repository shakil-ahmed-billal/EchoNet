import express from 'express';
import { CommentControllers } from './comment.controller.js';

const router = express.Router();

router.post('/post/:postId', CommentControllers.createComment);
router.get('/post/:postId', CommentControllers.getCommentsForPost);
router.delete('/:id', CommentControllers.deleteComment);

export const CommentRoutes = router;
