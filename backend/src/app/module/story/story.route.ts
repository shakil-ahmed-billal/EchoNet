import { Router } from 'express';
import { StoryControllers } from './story.controller.js';
import auth from '../../middleware/auth.js';
import { upload } from '../../middleware/multer.js';
import { Role } from '../../../../generated/prisma/client/index.js';

const router = Router();

// GET all active stories for the current user's feed
router.get('/', auth(Role.USER, Role.ADMIN, Role.MODERATOR), StoryControllers.getStories);

// POST create a new story (with image upload)
router.post('/', auth(Role.USER, Role.ADMIN, Role.MODERATOR), upload.single('media'), StoryControllers.createStory);

// DELETE own story
router.delete('/:id', auth(Role.USER, Role.ADMIN, Role.MODERATOR), StoryControllers.deleteStory);

// POST mark a story as viewed
router.post('/:id/view', auth(Role.USER, Role.ADMIN, Role.MODERATOR), StoryControllers.viewStory);

export const StoryRoutes = router;
