import { Router } from 'express';
import { HashtagControllers } from './hashtag.controller.js';

const router = Router();

router.get('/trending', HashtagControllers.getTrendingHashtags);

export const HashtagRoutes = router;
