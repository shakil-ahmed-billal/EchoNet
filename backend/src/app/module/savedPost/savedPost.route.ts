import { Router } from 'express';
import { SavedPostControllers } from './savedPost.controller.js';
import auth from '../../middleware/auth.js';

const router = Router();
console.log("SavedPostRoutes router initialized");

router.use((req, res, next) => {
    console.log(`SavedPost request: ${req.method} ${req.url}`);
    next();
});

router.post('/:postId', auth('USER', 'ADMIN', 'MODERATOR'), SavedPostControllers.savePost);
router.delete('/:postId', auth('USER', 'ADMIN', 'MODERATOR'), SavedPostControllers.unsavePost);
router.get('/', auth('USER', 'ADMIN', 'MODERATOR'), SavedPostControllers.getSavedPosts);

export const SavedPostRoutes = router;
