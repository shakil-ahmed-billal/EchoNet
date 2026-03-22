import express from 'express';
import { UserControllers } from './user.controller.js';
import { optionalAuth } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', UserControllers.getAllUsers);
router.get('/:id', optionalAuth, UserControllers.getUserById);
router.patch('/:id', UserControllers.updateUser);
router.patch('/:id/suspend', UserControllers.suspendUser);

export const UserRoutes = router;
