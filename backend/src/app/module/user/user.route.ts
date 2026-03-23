import express from 'express';
import { UserControllers } from './user.controller.js';
import { optionalAuth } from '../../middleware/auth.js';
import auth from '../../middleware/auth.js';
import { Role } from '../../../../generated/prisma/client/index.js';

const router = express.Router();

router.get('/', optionalAuth, UserControllers.getAllUsers);
router.get('/:id', optionalAuth, UserControllers.getUserById);
router.patch('/:id', auth(Role.USER, Role.ADMIN, Role.MODERATOR), UserControllers.updateUser);
router.patch('/:id/suspend', auth(Role.ADMIN, Role.MODERATOR), UserControllers.suspendUser);

export const UserRoutes = router;
