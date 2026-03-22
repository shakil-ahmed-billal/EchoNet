import express from 'express';
import { LikeControllers } from './like.controller.js';

const router = express.Router();

router.post('/toggle', LikeControllers.toggleLike);

export const LikeRoutes = router;
