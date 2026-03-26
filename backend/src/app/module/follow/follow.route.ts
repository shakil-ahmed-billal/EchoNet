import { Router } from 'express';
import { FollowControllers } from './follow.controller.js';
// import { auth } from '../../middleware/auth.js'; // Assuming you have an auth middleware

import auth from '../../middleware/auth.js';
import { Role } from '../../../../generated/prisma/client/index.js';

const router = Router();

router.use(auth(Role.USER, Role.ADMIN, Role.MODERATOR));

router.post('/follow', FollowControllers.followUser);
router.post('/accept', FollowControllers.acceptFollow);
router.post('/unfollow', FollowControllers.unfollowUser);
router.get('/requests', FollowControllers.getPendingRequests);
router.get('/suggestions', FollowControllers.getSuggestions);
router.get('/:userId/followers', FollowControllers.getFollowers);
router.get('/:userId/following', FollowControllers.getFollowing);

export const FollowRoutes = router;
