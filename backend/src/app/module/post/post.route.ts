import express from 'express';
import { PostControllers } from './post.controller.js';

const router = express.Router();

router.post('/', PostControllers.createPost);
router.get('/', PostControllers.getAllPosts);
router.patch('/:id/status', PostControllers.updatePostStatus);
router.delete('/:id', PostControllers.deletePost);

export const PostRoutes = router;
