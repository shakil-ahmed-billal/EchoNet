import express from 'express';
import { LikeControllers } from './like.controller.js';

import auth from '../../middleware/auth.js';
import { Role } from '../../../../generated/prisma/client/index.js';

const router = express.Router();

router.post('/toggle', auth(Role.USER, Role.ADMIN, Role.MODERATOR), LikeControllers.toggleLike);

export const LikeRoutes = router;
